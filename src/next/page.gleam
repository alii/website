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
