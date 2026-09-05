import api.{type Request, type Response}
import gleam/javascript/promise.{type Promise}
import gleam/option.{Some}
import site/monzo_oauth

pub fn handle(request: Request) -> Promise(Response) {
  promise.resolve(case api.query(request, "platform") {
    Some("monzo") -> api.redirect(monzo_oauth.url())
    _ -> api.redirect("/oauth/error?message=Invalid%20platform")
  })
}
