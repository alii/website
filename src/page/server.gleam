import gleam/option.{type Option}
import js.{type Nullable}

pub type Request

@external(javascript, "./server_ffi.ts", "cookie")
fn cookie_raw(request: Request, name: String) -> Nullable(String)

pub fn cookie(request: Request, name: String) -> Option(String) {
  js.to_option(cookie_raw(request, name))
}

pub type Response(props) {
  Render(props: props)
  Redirect(to: String, permanent: Bool)
  NotFound
}
