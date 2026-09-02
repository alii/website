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

/// Reinterpret a JS value as another type. Only for cases where the runtime
/// representation is already right, like the ones below.
@external(javascript, "./react_ffi.ts", "identity")
fn coerce(value: a) -> b

/// A string is already a valid React child.
pub fn text(text: String) -> Element {
  coerce(text)
}

pub fn to_dynamic(value: a) -> Dynamic {
  coerce(value)
}

/// Renders nothing, like `null` in JSX. Gleam's `Nil` is `undefined` in
/// JavaScript, which React also renders as nothing.
pub fn none() -> Element {
  coerce(Nil)
}
