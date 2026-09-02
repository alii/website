//// Pages rendered on the server for each request.

import gleam/option.{type Option}
import js.{type Nullable}

/// The incoming request.
pub type Request

@external(javascript, "./server_ffi.ts", "cookie")
fn cookie_raw(request: Request, name: String) -> Nullable(String)

pub fn cookie(request: Request, name: String) -> Option(String) {
  js.to_option(cookie_raw(request, name))
}

/// What to send back.
pub type Response(props) {
  Render(props: props)
  Redirect(to: String, permanent: Bool)
  NotFound
}
