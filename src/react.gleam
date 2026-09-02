import gleam/dynamic.{type Dynamic}
import gleam/javascript/array.{type Array}
import gleam/list
import js

/// A React element (the thing JSX would produce).
pub type Element

/// A React component value, e.g. the default export of `next/link`.
pub type Component

/// A props object: React prop names to values.
pub type Props

/// One prop on an element. `name` is the React prop name (`className`, `href`).
pub type Attribute {
  /// A string-valued prop: `className`, `href`, `src`...
  Attribute(name: String, value: String)
  /// A boolean prop: `async`, `defer`, `suppressHydrationWarning`...
  Flag(name: String, value: Bool)
  /// A prop whose value is some other JS value, like the `{__html}` object
  /// of `dangerouslySetInnerHTML`.
  Property(name: String, value: Dynamic)
}

@external(javascript, "./react_ffi.ts", "props")
fn props_ffi(entries: Array(#(String, Dynamic))) -> Props

pub fn props(attrs: List(Attribute)) -> Props {
  attrs
  |> list.map(entry)
  |> array.from_list
  |> props_ffi
}

/// The one place a typed attribute becomes an untyped React prop value.
fn entry(attr: Attribute) -> #(String, Dynamic) {
  case attr {
    Attribute(name, value) -> #(name, js.dynamic(value))
    Flag(name, value) -> #(name, js.dynamic(value))
    Property(name, value) -> #(name, value)
  }
}

@external(javascript, "./react_ffi.ts", "create")
fn create_tag(tag: String, props: Props, children: Array(Element)) -> Element

@external(javascript, "./react_ffi.ts", "create")
fn create_component(
  component: Component,
  props: Props,
  children: Array(Element),
) -> Element

@external(javascript, "./react_ffi.ts", "fragment")
fn fragment_component() -> Component

pub fn element(
  tag: String,
  attrs: List(Attribute),
  children: List(Element),
) -> Element {
  create_tag(tag, props(attrs), array.from_list(children))
}

pub fn component(
  component: Component,
  attrs: List(Attribute),
  children: List(Element),
) -> Element {
  create_component(component, props(attrs), array.from_list(children))
}

/// Render a component with a props object as is, no attribute list.
pub fn with_props(component: Component, props: Props) -> Element {
  create_component(component, props, array.from_list([]))
}

pub fn fragment(children: List(Element)) -> Element {
  create_component(fragment_component(), props([]), array.from_list(children))
}

/// A string is already a valid React child, so this is the identity function
/// with a more precise type.
@external(javascript, "./js_ffi.ts", "identity")
pub fn text(text: String) -> Element

/// Renders nothing, like `null` in JSX: an empty fragment.
pub fn none() -> Element {
  fragment([])
}
