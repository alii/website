import api.{type Request, type Response}
import gleam/javascript/promise.{type Promise}
import gleam/option.{None, Some}
import site/cookie
import site/date
import site/monzo_oauth

pub fn handle(request: Request) -> Promise(Response) {
  case api.query(request, "code"), api.query(request, "platform") {
    None, _ ->
      promise.resolve(api.redirect("/oauth/error?message=Invalid%20code"))
    Some(code), Some("monzo") -> {
      use client <- promise.map(monzo_oauth.exchange(code))
      api.redirect("/monzo/dashboard")
      |> api.with_header(
        "Set-Cookie",
        cookie.set(
          "token",
          monzo_oauth.session_token(client),
          expires: date.now() + date.day_ms,
          same_site: cookie.Strict,
        ),
      )
    }
    _, _ ->
      promise.resolve(api.redirect("/oauth/error?message=Invalid%20platform"))
  }
}
