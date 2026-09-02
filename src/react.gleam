import gleam/dynamic.{type Dynamic}
import gleam/javascript/array.{type Array}
import gleam/list
import js

pub type Element

pub type Component

pub type Props

pub type Attribute {
  Attribute(name: String, value: String)
  Flag(name: String, value: Bool)
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

// the one place a typed attribute becomes an untyped prop value
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

pub fn with_props(component: Component, props: Props) -> Element {
  create_component(component, props, array.from_list([]))
}

pub fn fragment(children: List(Element)) -> Element {
  create_component(fragment_component(), props([]), array.from_list(children))
}

// a string is already a valid child: identity with a narrower type
@external(javascript, "./js_ffi.ts", "identity")
pub fn text(text: String) -> Element

pub fn none() -> Element {
  fragment([])
}
