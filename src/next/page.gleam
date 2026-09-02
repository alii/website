import gleam/javascript/array
import gleam/list
import gleam/option.{type Option, None, Some}
import js

@external(javascript, "../js_ffi.ts", "identity")
fn coerce(value: a) -> b

/// What a page's `get_static_props` resolves to. The type parameter is the
/// page's props record, so the annotation on `get_static_props` pins down
/// what the body must build.
pub type StaticProps(props)

/// `props` is any record; its fields become the page's props.
pub fn static_props(
  props: props,
  revalidate revalidate: Option(Int),
) -> StaticProps(props) {
  let fields = [#("props", js.dynamic(js.plain(props)))]
  let fields = case revalidate {
    Some(seconds) -> [#("revalidate", js.dynamic(seconds)), ..fields]
    None -> fields
  }
  coerce(js.object(fields))
}

/// `{notFound: true}`: render the 404 page.
pub fn not_found() -> StaticProps(props) {
  coerce(js.object([#("notFound", js.dynamic(True))]))
}

/// What `get_static_paths` resolves to.
pub type StaticPaths

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
  let fallback = case fallback {
    Blocking -> js.dynamic("blocking")
    Disabled -> js.dynamic(False)
    Enabled -> js.dynamic(True)
  }
  let paths =
    list.map(params, fn(params) {
      js.object([#("params", js.dynamic(js.plain(params)))])
    })
  coerce(
    js.object([
      #("paths", js.dynamic(array.from_list(paths))),
      #("fallback", fallback),
    ]),
  )
}

/// What a page's `get_server_side_props` resolves to.
pub type ServerSideProps(props)

pub fn server_side_props(props: props) -> ServerSideProps(props) {
  coerce(js.object([#("props", js.dynamic(js.plain(props)))]))
}

/// `{redirect: {destination, permanent}}` from `get_server_side_props`.
pub fn redirect(
  destination: String,
  permanent permanent: Bool,
) -> ServerSideProps(props) {
  let redirect =
    js.object([
      #("destination", js.dynamic(destination)),
      #("permanent", js.dynamic(permanent)),
    ])
  coerce(js.object([#("redirect", js.dynamic(redirect))]))
}

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
