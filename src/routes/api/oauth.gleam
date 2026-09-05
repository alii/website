//// The serverless Discord OAuth demo: send the user to Discord, then trade
//// the code for their profile and keep it in a signed cookie.

import api.{type Request, type Response}
import codec.{type Codec}
import gleam/dynamic.{type Dynamic}
import gleam/dynamic/decode
import gleam/fetch
import gleam/http
import gleam/http/request
import gleam/javascript/promise.{type Promise}
import gleam/json.{type Json}
import gleam/option.{type Option, None, Some}
import gleam/result
import gleam/uri
import site/cookie
import site/date
import site/env

const scope = "identify email"

pub fn handle(request: Request) -> Promise(Response) {
  case api.query(request, "code") {
    None -> promise.resolve(api.redirect(authorize_url()))
    Some(code) -> {
      use exchanged <- promise.map(exchange(code))
      case exchanged {
        Error(message) -> api.error(500, message)
        Ok(user) ->
          api.redirect("/demos/serverless-discord-oauth")
          |> api.with_header(
            "Set-Cookie",
            cookie.set(
              "token",
              sign(codec.encode(user_codec(), user)),
              expires: date.now() + date.day_ms,
              same_site: cookie.Lax,
            ),
          )
      }
    }
  }
}

/// Where to send the user to ask for authorization.
fn authorize_url() -> String {
  "https://discord.com/api/oauth2/authorize?client_id="
  <> env.discord_demo_client_id()
  <> "&redirect_uri="
  <> env.discord_demo_redirect_uri()
  <> "&response_type=code&scope="
  <> scope
}

pub type User {
  User(
    id: String,
    username: String,
    discriminator: String,
    avatar: Option(String),
  )
}

fn user_codec() -> Codec(User) {
  codec.object4(
    User,
    codec.field("id", codec.string(), fn(u: User) { u.id }),
    codec.field("username", codec.string(), fn(u: User) { u.username }),
    codec.field("discriminator", codec.string(), fn(u: User) { u.discriminator }),
    codec.field("avatar", codec.option(codec.string()), fn(u: User) { u.avatar }),
  )
}

/// Trade the callback code for the user's profile.
fn exchange(code: String) -> Promise(Result(User, String)) {
  let form = [
    #("client_id", env.discord_demo_client_id()),
    #("client_secret", env.discord_demo_client_secret()),
    #("redirect_uri", env.discord_demo_redirect_uri()),
    #("grant_type", "authorization_code"),
    #("code", code),
    #("scope", scope),
  ]
  let assert Ok(token_request) =
    request.to("https://discord.com/api/oauth2/token")
  let token_request =
    token_request
    |> request.set_method(http.Post)
    |> request.set_header("content-type", "application/x-www-form-urlencoded")
    |> request.set_body(uri.query_to_string(form))
  use token <- promise.await(read_json(token_request, "the token exchange"))
  case
    result.try(token, fn(body) {
      decode.run(body, decode.at(["access_token"], decode.string))
      |> result.replace_error("Discord did not return an access token")
    })
  {
    Error(message) -> promise.resolve(Error(message))
    Ok(access_token) -> {
      let assert Ok(me) = request.to("https://discord.com/api/users/@me")
      let me =
        request.set_header(me, "authorization", "Bearer " <> access_token)
      use profile <- promise.map(read_json(me, "the profile request"))
      use body <- result.try(profile)
      decode.run(body, codec.decoder(user_codec()))
      |> result.replace_error("Discord returned an unexpected profile")
    }
  }
}

fn read_json(
  request: request.Request(String),
  what: String,
) -> Promise(Result(Dynamic, String)) {
  use sent <- promise.await(fetch.send(request))
  case sent {
    Error(_) -> promise.resolve(Error("Could not reach Discord for " <> what))
    Ok(response) -> {
      use read <- promise.map(fetch.read_json_body(response))
      read
      |> result.map(fn(response) { response.body })
      |> result.replace_error("Could not read Discord's reply to " <> what)
    }
  }
}

/// The profile, signed into the session token.
@external(javascript, "./oauth_ffi.ts", "sign")
fn sign(user: Json) -> String
