//// The existing TSX <Layout>.

import react.{type Element}

@external(javascript, "./layout_ffi.ts", "layout")
pub fn layout(children: List(Element)) -> Element
