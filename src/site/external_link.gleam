import attribute as a
import gleam/list
import html
import react.{type Attribute, type Element}

/// An `<a>` that opens in a new tab.
pub fn link(attrs: List(Attribute), children: List(Element)) -> Element {
  html.a(
    list.append(attrs, [a.target("_blank"), a.rel("noopener noreferrer")]),
    children,
  )
}
