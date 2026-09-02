//// `next/head`: elements to put in the document `<head>` for this page.

import react.{type Component, type Element}

@external(javascript, "./next_ffi.ts", "head")
fn head_component() -> Component

pub fn head(children: List(Element)) -> Element {
  react.component(head_component(), [], children)
}
