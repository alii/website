import codec.{type Codec}
import gleam/dynamic.{type Dynamic}
import gleam/dynamic/decode
import gleam/javascript/array.{type Array}
import gleam/javascript/promise.{type Promise}
import gleam/json.{type Json}
import gleam/list
import gleam/option.{None, Some}
import gleam/string
import page.{
  type Loaded, type Paths, Found, NotFound, Paths, RenderOnDemand, ServeNotFound,
  ServePlaceholder,
}
import page/server.{type Request, type Response, Redirect, Render}
import react.{type Element}

pub type StaticContext

pub type StaticResult

pub type PathsResult

pub type ServerResult

type Path

@external(javascript, "./runtime_ffi.ts", "contextParams")
fn context_params(context: StaticContext) -> Dynamic

@external(javascript, "./runtime_ffi.ts", "staticProps")
fn static_props_ffi(props: Json) -> StaticResult

@external(javascript, "./runtime_ffi.ts", "staticPropsRevalidating")
fn static_props_revalidating(props: Json, seconds: Int) -> StaticResult

@external(javascript, "./runtime_ffi.ts", "notFound")
fn static_not_found() -> StaticResult

@external(javascript, "./runtime_ffi.ts", "notFound")
fn server_not_found() -> ServerResult

@external(javascript, "./runtime_ffi.ts", "path")
fn path(params: Json) -> Path

@external(javascript, "./runtime_ffi.ts", "staticPaths")
fn static_paths_ffi(paths: Array(Path), placeholder: Bool) -> PathsResult

@external(javascript, "./runtime_ffi.ts", "staticPathsBlocking")
fn static_paths_blocking(paths: Array(Path)) -> PathsResult

@external(javascript, "./runtime_ffi.ts", "serverProps")
fn server_props_ffi(props: Json) -> ServerResult

@external(javascript, "./runtime_ffi.ts", "redirect")
fn redirect(to: String, permanent: Bool) -> ServerResult

pub fn static_props(
  load: fn(params) -> Promise(Loaded(props)),
  params: Codec(params),
  props: Codec(props),
  context: StaticContext,
) -> Promise(StaticResult) {
  case decode.run(context_params(context), codec.decoder(params)) {
    Ok(params) -> promise.map(load(params), loaded(_, props))
    Error(_) -> promise.resolve(static_not_found())
  }
}

pub fn static_props_without_params(
  load: fn() -> Promise(Loaded(props)),
  props: Codec(props),
  _context: StaticContext,
) -> Promise(StaticResult) {
  promise.map(load(), loaded(_, props))
}

fn loaded(loaded: Loaded(props), props: Codec(props)) -> StaticResult {
  case loaded {
    Found(value, revalidate: None) ->
      static_props_ffi(codec.encode(props, value))
    Found(value, revalidate: Some(seconds)) ->
      static_props_revalidating(codec.encode(props, value), seconds)
    NotFound -> static_not_found()
  }
}

pub fn static_paths(
  paths: fn() -> Promise(Paths(params)),
  params: Codec(params),
) -> Promise(PathsResult) {
  use Paths(prerender, others) <- promise.map(paths())
  let paths =
    prerender
    |> list.map(fn(value) { path(codec.encode(params, value)) })
    |> array.from_list
  case others {
    RenderOnDemand -> static_paths_blocking(paths)
    ServeNotFound -> static_paths_ffi(paths, False)
    ServePlaceholder -> static_paths_ffi(paths, True)
  }
}

pub fn server_props(
  respond: fn(Request) -> Promise(Response(props)),
  props: Codec(props),
  request: Request,
) -> Promise(ServerResult) {
  use response <- promise.map(respond(request))
  case response {
    Render(value) -> server_props_ffi(codec.encode(props, value))
    Redirect(to, permanent) -> redirect(to, permanent)
    server.NotFound -> server_not_found()
  }
}

pub fn render(
  view: fn(props) -> Element,
  props: Codec(props),
  raw: Dynamic,
) -> Element {
  case decode.run(raw, codec.decoder(props)) {
    Ok(value) -> view(value)
    Error(errors) ->
      panic as {
        "page props did not match their codec: " <> string.inspect(errors)
      }
  }
}
