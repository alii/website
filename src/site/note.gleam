//// The existing TSX <Note>.

import react.{type Element}

pub type Variant {
  Warning
  Info
  Success
}

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
  note_ffi(variant, title, children)
}

@external(javascript, "./note_ffi.ts", "note")
fn note_ffi(variant: String, title: String, children: List(Element)) -> Element
