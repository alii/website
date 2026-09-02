import gleam/option.{type Option}

/// What a page's `get_static_props` resolves to. The type parameter is the
/// page's props record, so the annotation on `get_static_props` pins down
/// what the body must build.
pub type StaticProps(props)

/// `props` is any record; its fields become the page's props.
@external(javascript, "./next_ffi.ts", "staticProps")
pub fn static_props(
  props: props,
  revalidate revalidate: Option(Int),
) -> StaticProps(props)

/// `{notFound: true}`: render the 404 page.
@external(javascript, "./next_ffi.ts", "notFound")
pub fn not_found() -> StaticProps(props)

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
    Blocking -> "blocking"
    Disabled -> "false"
    Enabled -> "true"
  }
  static_paths_ffi(params, fallback)
}

@external(javascript, "./next_ffi.ts", "staticPaths")
fn static_paths_ffi(params: List(params), fallback: String) -> StaticPaths

/// What a page's `get_server_side_props` resolves to.
pub type ServerSideProps(props)

@external(javascript, "./next_ffi.ts", "serverSideProps")
pub fn server_side_props(props: props) -> ServerSideProps(props)
