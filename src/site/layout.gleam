import gleam/javascript/array.{type Array}
import react.{type Element}

@external(javascript, "./layout_ffi.ts", "layout")
fn layout_component(children: Array(Element)) -> Element

pub fn layout(children: List(Element)) -> Element {
  layout_component(array.from_list(children))
}
