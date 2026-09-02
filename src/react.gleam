import gleam/dynamic.{type Dynamic}

/// A React element (the thing JSX would produce).
pub type Element

/// A React component value, e.g. the default export of `next/link`.
pub type Component

/// One prop on an element. `name` is the React prop name (`className`, `href`).
pub type Attribute {
  Attribute(name: String, value: Dynamic)
}

@external(javascript, "./react_ffi.mjs", "element")
pub fn element(
  tag: String,
  attrs: List(Attribute),
  children: List(Element),
) -> Element

@external(javascript, "./react_ffi.mjs", "element")
pub fn component(
  component: Component,
  attrs: List(Attribute),
  children: List(Element),
) -> Element

@external(javascript, "./react_ffi.mjs", "fragment")
pub fn fragment(children: List(Element)) -> Element

@external(javascript, "./react_ffi.mjs", "identity")
pub fn text(text: String) -> Element

@external(javascript, "./react_ffi.mjs", "identity")
pub fn to_dynamic(value: a) -> Dynamic

/// Renders nothing, like `null` in JSX.
@external(javascript, "./react_ffi.mjs", "none")
pub fn none() -> Element
