//// The existing TSX <Note>.

import gleam/javascript/array.{type Array}
import react.{type Element}

pub type Variant {
  Warning
  Info
  Success
}

@external(javascript, "./note_ffi.ts", "note")
fn note_component(
  variant: String,
  title: String,
  children: Array(Element),
) -> Element

pub fn note(
  variant: Variant,
  title: String,
  children: List(Element),
) -> Element {
  let variant = case variant {
    Warning -> "warning"
    Info -> "info"
    Success -> "success"
  }
  note_component(variant, title, array.from_list(children))
}
