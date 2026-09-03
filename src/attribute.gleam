import gleam/javascript/array.{type Array}
import js
import react.{type Attribute, Attribute, Flag, Property}

pub fn attr(name: String, value: String) -> Attribute {
  Attribute(name, value)
}

pub fn class(value: String) -> Attribute {
  Attribute("className", value)
}

pub fn href(value: String) -> Attribute {
  Attribute("href", value)
}

pub fn target(value: String) -> Attribute {
  Attribute("target", value)
}

pub fn key(value: String) -> Attribute {
  Attribute("key", value)
}

pub fn rel(value: String) -> Attribute {
  Attribute("rel", value)
}

pub fn type_(value: String) -> Attribute {
  Attribute("type", value)
}

pub fn title(value: String) -> Attribute {
  Attribute("title", value)
}

pub fn as_(value: String) -> Attribute {
  Attribute("as", value)
}

pub fn cross_origin(value: String) -> Attribute {
  Attribute("crossOrigin", value)
}

pub fn src(value: String) -> Attribute {
  Attribute("src", value)
}

pub fn alt(value: String) -> Attribute {
  Attribute("alt", value)
}

pub fn name(value: String) -> Attribute {
  Attribute("name", value)
}

pub fn content(value: String) -> Attribute {
  Attribute("content", value)
}

pub fn property(value: String) -> Attribute {
  Attribute("property", value)
}

pub fn flag(name: String, value: Bool) -> Attribute {
  Flag(name, value)
}

pub fn async(value: Bool) -> Attribute {
  Flag("async", value)
}

pub fn defer(value: Bool) -> Attribute {
  Flag("defer", value)
}

pub fn suppress_hydration_warning(value: Bool) -> Attribute {
  Flag("suppressHydrationWarning", value)
}

pub type InnerHtml

@external(javascript, "./attribute_ffi.ts", "innerHtml")
fn inner_html_value(html: String) -> InnerHtml

pub fn inner_html(html: String) -> Attribute {
  Property("dangerouslySetInnerHTML", js.dynamic(inner_html_value(html)))
}

pub type Style

@external(javascript, "./attribute_ffi.ts", "style")
fn style_value(entries: Array(#(String, String))) -> Style

/// React's `style` prop: camelCase property names
pub fn style(entries: List(#(String, String))) -> Attribute {
  Property("style", js.dynamic(style_value(array.from_list(entries))))
}
