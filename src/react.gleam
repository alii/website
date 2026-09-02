import gleam/dynamic.{type Dynamic}
import gleam/javascript/array.{type Array}
import gleam/list
import js.{type Object}

/// A React element (the thing JSX would produce).
pub type Element

/// A React component value, e.g. the default export of `next/link`.
pub type Component

/// A ready-made props object, like the `pageProps` Next hands to `_app`.
pub type Props =
  Object

/// One prop on an element. `name` is the React prop name (`className`, `href`).
pub type Attribute {
  Attribute(name: String, value: Dynamic)
}

@external(javascript, "./react_ffi.ts", "create")
fn create_tag(tag: String, props: Object, children: Array(Element)) -> Element

@external(javascript, "./react_ffi.ts", "create")
fn create_component(
  component: Component,
  props: Object,
  children: Array(Element),
) -> Element

@external(javascript, "./react_ffi.ts", "fragment")
fn fragment_component() -> Component

/// Reinterpret a JS value as another type. Only where the runtime
/// representation is already right, like the two uses below.
@external(javascript, "./js_ffi.ts", "identity")
fn coerce(value: a) -> b

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
  create_component(
    fragment_component(),
    js.object([]),
    array.from_list(children),
  )
}

fn props(attrs: List(Attribute)) -> Object {
  js.object(list.map(attrs, fn(attr) { #(attr.name, attr.value) }))
}

/// A string is already a valid React child.
pub fn text(text: String) -> Element {
  coerce(text)
}

/// Renders nothing, like `null` in JSX. Gleam's `Nil` is `undefined` in
/// JavaScript, which React also renders as nothing.
pub fn none() -> Element {
  coerce(Nil)
}
