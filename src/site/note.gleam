//// The existing TSX <Note>.

import attribute as a
import react.{type Component, type Element}

pub type Variant {
  Warning
  Info
  Success
}

@external(javascript, "./note_ffi.ts", "note")
fn note_component() -> Component

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
  react.component(
    note_component(),
    [a.attr("variant", variant), a.title(title)],
    children,
  )
}
