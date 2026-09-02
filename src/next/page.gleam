import gleam/javascript/array.{type Array}
import gleam/list
import gleam/option.{type Option, None, Some}
import js.{type Object}

/// What a page's `get_static_props` resolves to. The type parameter is the
/// page's props record, so the annotation on `get_static_props` pins down
/// what the body must build.
pub type StaticProps(props)

@external(javascript, "./next_ffi.ts", "staticProps")
fn static_props_ffi(props: Object) -> StaticProps(props)

@external(javascript, "./next_ffi.ts", "staticPropsRevalidating")
fn static_props_revalidating(props: Object, seconds: Int) -> StaticProps(props)

/// `props` is any record; its fields become the page's props.
pub fn static_props(
  props: props,
  revalidate revalidate: Option(Int),
) -> StaticProps(props) {
  case revalidate {
    Some(seconds) -> static_props_revalidating(js.plain(props), seconds)
    None -> static_props_ffi(js.plain(props))
  }
}

/// `{notFound: true}`: render the 404 page.
@external(javascript, "./next_ffi.ts", "notFound")
pub fn not_found() -> StaticProps(props)

/// What `get_static_paths` resolves to.
pub type StaticPaths

/// One pre-rendered path's route params.
pub type Path

@external(javascript, "./next_ffi.ts", "path")
fn path(params: Object) -> Path

@external(javascript, "./next_ffi.ts", "staticPaths")
fn static_paths_ffi(paths: Array(Path), fallback: Bool) -> StaticPaths

@external(javascript, "./next_ffi.ts", "staticPathsBlocking")
fn static_paths_blocking(paths: Array(Path)) -> StaticPaths

/// What to do for a path that was not pre-rendered.
pub type Fallback {
  /// Render it on the server on first request.
  Blocking
  /// 404.
  Disabled
  /// Serve a fallback version of the page while it renders.
  Enabled
}

/// `params` is any record; its fields become the route params.
pub fn static_paths(params: List(params), fallback: Fallback) -> StaticPaths {
  let paths =
    params
    |> list.map(fn(params) { path(js.plain(params)) })
    |> array.from_list
  case fallback {
    Blocking -> static_paths_blocking(paths)
    Disabled -> static_paths_ffi(paths, False)
    Enabled -> static_paths_ffi(paths, True)
  }
}

/// What a page's `get_server_side_props` resolves to.
pub type ServerSideProps(props)

@external(javascript, "./next_ffi.ts", "serverSideProps")
fn server_side_props_ffi(props: Object) -> ServerSideProps(props)

pub fn server_side_props(props: props) -> ServerSideProps(props) {
  server_side_props_ffi(js.plain(props))
}

/// `{redirect: {destination, permanent}}` from `get_server_side_props`.
@external(javascript, "./next_ffi.ts", "redirect")
pub fn redirect(
  destination: String,
  permanent permanent: Bool,
) -> ServerSideProps(props)

/// The argument to `get_static_props`.
pub type StaticPropsContext

@external(javascript, "./next_ffi.ts", "param")
fn param_raw(context: StaticPropsContext, name: String) -> js.Nullable(String)

/// A route parameter, like `slug` for `pages/[slug]`.
pub fn param(context: StaticPropsContext, name: String) -> Option(String) {
  js.to_option(param_raw(context, name))
}

/// The argument to `get_server_side_props`.
pub type ServerSidePropsContext

@external(javascript, "./next_ffi.ts", "cookie")
fn cookie_raw(
  context: ServerSidePropsContext,
  name: String,
) -> js.Nullable(String)

/// A cookie on the request.
pub fn cookie(context: ServerSidePropsContext, name: String) -> Option(String) {
  js.to_option(cookie_raw(context, name))
}
