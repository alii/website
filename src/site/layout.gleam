import react.{type Component, type Element}

@external(javascript, "./layout_ffi.mjs", "layout")
fn layout_component() -> Component

/// The existing TSX <Layout>, used from Gleam untouched.
pub fn layout(children: List(Element)) -> Element {
  react.component(layout_component(), [], children)
}
