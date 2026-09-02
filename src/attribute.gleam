import js
import react.{type Attribute, Attribute}

pub fn attr(name: String, value: String) -> Attribute {
  Attribute(name, js.dynamic(value))
}

pub fn class(value: String) -> Attribute {
  attr("className", value)
}

pub fn href(value: String) -> Attribute {
  attr("href", value)
}

pub fn target(value: String) -> Attribute {
  attr("target", value)
}

pub fn key(value: String) -> Attribute {
  attr("key", value)
}

pub fn rel(value: String) -> Attribute {
  attr("rel", value)
}

pub fn type_(value: String) -> Attribute {
  attr("type", value)
}

pub fn title(value: String) -> Attribute {
  attr("title", value)
}

pub fn as_(value: String) -> Attribute {
  attr("as", value)
}

pub fn cross_origin(value: String) -> Attribute {
  attr("crossOrigin", value)
}

pub fn src(value: String) -> Attribute {
  attr("src", value)
}

pub fn alt(value: String) -> Attribute {
  attr("alt", value)
}

pub fn name(value: String) -> Attribute {
  attr("name", value)
}

pub fn content(value: String) -> Attribute {
  attr("content", value)
}

pub fn property(value: String) -> Attribute {
  attr("property", value)
}

pub fn async(value: Bool) -> Attribute {
  Attribute("async", js.dynamic(value))
}

pub fn defer(value: Bool) -> Attribute {
  Attribute("defer", js.dynamic(value))
}

pub fn suppress_hydration_warning(value: Bool) -> Attribute {
  Attribute("suppressHydrationWarning", js.dynamic(value))
}

/// The `{__html}` object `dangerouslySetInnerHTML` takes.
pub type InnerHtml

@external(javascript, "./attribute_ffi.ts", "innerHtml")
fn inner_html_value(html: String) -> InnerHtml

/// `dangerouslySetInnerHTML`
pub fn inner_html(html: String) -> Attribute {
  Attribute("dangerouslySetInnerHTML", js.dynamic(inner_html_value(html)))
}
