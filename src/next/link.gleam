import react.{type Attribute, type Component, type Element}

@external(javascript, "./next_ffi.mjs", "link")
fn link_component() -> Component

pub fn link(attrs: List(Attribute), children: List(Element)) -> Element {
  react.component(link_component(), attrs, children)
}
