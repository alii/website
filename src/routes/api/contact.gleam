import api.{type Request, type Response}
import gleam/dynamic/decode
import gleam/fetch
import gleam/http
import gleam/http/request
import gleam/javascript/promise.{type Promise}
import gleam/json
import gleam/option.{type Option, None, Some}
import gleam/result
import gleam/string
import gleam/uri
import js
import site/env

type Submission {
  Submission(email: String, body: String, turnstile: String)
}

fn submission() -> decode.Decoder(Submission) {
  use email <- decode.field("email", decode.string)
  use body <- decode.field("body", decode.string)
  use turnstile <- decode.field("turnstile", decode.string)
  let length = string.length(body)
  case string.contains(email, "@"), length >= 10 && length <= 500 {
    True, True -> decode.success(Submission(email:, body:, turnstile:))
    False, _ -> decode.failure(Submission("", "", ""), "an email address")
    _, False ->
      decode.failure(Submission("", "", ""), "a body of 10 to 500 characters")
  }
}

pub fn handle(request: Request) -> Promise(Response) {
  use <- api.only(request, http.Post)
  case decode.run(api.body(request), submission()) {
    Error(_) -> promise.resolve(api.error(400, "Invalid submission"))
    Ok(submission) -> submit(request, submission)
  }
}

fn submit(request: Request, submission: Submission) -> Promise(Response) {
  let ip =
    api.header(request, "x-forwarded-for")
    |> option.or(api.remote_address(request))
  use verified <- promise.await(verify_turnstile(submission.turnstile, ip))
  case verified {
    Error(message) -> promise.resolve(api.error(500, message))
    Ok(#(False, _)) ->
      promise.resolve(api.error(400, "Invalid turnstile token, robot!"))
    Ok(#(True, outcome)) -> {
      use notified <- promise.map(notify(submission, ip, outcome))
      case notified {
        Error(response) -> response
        Ok(Nil) ->
          case api.header(request, "content-type") {
            Some("application/json") ->
              api.ok(json.object([#("sent", json.bool(True))]))
            _ -> api.redirect("/thanks")
          }
      }
    }
  }
}

/// Cloudflare's verdict, and its whole reply for the notification.
fn verify_turnstile(
  token: String,
  ip: Option(String),
) -> Promise(Result(#(Bool, String), String)) {
  let form = [
    #("secret", env.turnstile_secret_key()),
    #("response", token),
    ..case ip {
      Some(ip) -> [#("remoteip", ip)]
      None -> []
    }
  ]
  let assert Ok(request) =
    request.to("https://challenges.cloudflare.com/turnstile/v0/siteverify")
  let request =
    request
    |> request.set_method(http.Post)
    |> request.set_header("content-type", "application/x-www-form-urlencoded")
    |> request.set_body(uri.query_to_string(form))
  use sent <- promise.await(fetch.send(request))
  case sent {
    Error(_) -> promise.resolve(Error("Could not reach Turnstile"))
    Ok(response) -> {
      use read <- promise.map(fetch.read_json_body(response))
      use response <- result.try(result.replace_error(
        read,
        "Could not read Turnstile's reply",
      ))
      let success =
        decode.run(response.body, decode.at(["success"], decode.bool))
        |> result.unwrap(False)
      let reply = js.json(response.body, 2) |> js.to_option |> option.unwrap("")
      Ok(#(success, reply))
    }
  }
}

fn notify(
  submission: Submission,
  ip: Option(String),
  turnstile_reply: String,
) -> Promise(Result(Nil, Response)) {
  let payload =
    json.object([
      #("content", json.string("contact form submission")),
      #(
        "embeds",
        json.preprocessed_array([
          json.object([
            #("description", json.string(submission.body)),
            #("author", json.object([#("name", json.string(submission.email))])),
            #(
              "fields",
              json.preprocessed_array([
                json.object([
                  #("name", json.string("ip")),
                  #("value", json.string(option.unwrap(ip, "unknown!?"))),
                ]),
              ]),
            ),
          ]),
          json.object([
            #("title", json.string("turnstile")),
            #("description", json.string(codeblock(turnstile_reply, "json"))),
          ]),
        ]),
      ),
    ])
  let assert Ok(request) = request.to(env.discord_webhook())
  let request =
    request
    |> request.set_method(http.Post)
    |> request.set_header("content-type", "application/json")
    |> request.set_body(json.to_string(payload))
  use sent <- promise.map(fetch.send(request))
  case sent {
    Error(_) -> Error(api.error(500, "Error sending notification"))
    Ok(response) if response.status >= 400 ->
      Error(api.error(response.status, "Error sending notification"))
    Ok(_) -> Ok(Nil)
  }
}

fn codeblock(code: String, language: String) -> String {
  "```" <> language <> "\n" <> code <> "\n```"
}
