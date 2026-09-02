import gleam/option.{type Option}

/// The value a page's `get_static_props` resolves to.
pub type StaticProps

/// `props` is any record; its fields become the page's props.
@external(javascript, "./next_ffi.mjs", "staticProps")
pub fn static_props(
  props: props,
  revalidate revalidate: Option(Int),
) -> StaticProps
