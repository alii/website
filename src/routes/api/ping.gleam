import api.{type Request, type Response}
import gleam/http
import gleam/javascript/promise.{type Promise}
import gleam/json
import site/date

pub fn handle(request: Request) -> Promise(Response) {
  use <- api.only(request, http.Get)
  promise.resolve(api.ok(json.int(date.now())))
}
