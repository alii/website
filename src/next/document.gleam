import react.{type Attribute, type Component, type Element}

@external(javascript, "./document_ffi.ts", "documentHtml")
fn html_component() -> Component

@external(javascript, "./document_ffi.ts", "documentHead")
fn head_component() -> Component

@external(javascript, "./document_ffi.ts", "documentMain")
fn main_component() -> Component

@external(javascript, "./document_ffi.ts", "documentNextScript")
fn next_script_component() -> Component

pub fn html(attrs: List(Attribute), children: List(Element)) -> Element {
  react.component(html_component(), attrs, children)
}

pub fn head(attrs: List(Attribute), children: List(Element)) -> Element {
  react.component(head_component(), attrs, children)
}

pub fn main() -> Element {
  react.component(main_component(), [], [])
}

pub fn next_script() -> Element {
  react.component(next_script_component(), [], [])
}
