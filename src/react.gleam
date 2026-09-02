import gleam/dynamic.{type Dynamic}

/// A React element (the thing JSX would produce).
pub type Element

/// A React component value, e.g. the default export of `next/link`.
pub type Component

/// One prop on an element. `name` is the React prop name (`className`, `href`).
pub type Attribute {
  Attribute(name: String, value: Dynamic)
}

@external(javascript, "./react_ffi.ts", "element")
pub fn element(
  tag: String,
  attrs: List(Attribute),
  children: List(Element),
) -> Element

@external(javascript, "./react_ffi.ts", "element")
pub fn component(
  component: Component,
  attrs: List(Attribute),
  children: List(Element),
) -> Element

@external(javascript, "./react_ffi.ts", "fragment")
pub fn fragment(children: List(Element)) -> Element

@external(javascript, "./react_ffi.ts", "identity")
pub fn text(text: String) -> Element

@external(javascript, "./react_ffi.ts", "identity")
pub fn to_dynamic(value: a) -> Dynamic

/// Renders nothing, like `null` in JSX.
@external(javascript, "./react_ffi.ts", "none")
pub fn none() -> Element
