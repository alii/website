import react.{type Attribute, Attribute}

pub fn attr(name: String, value: String) -> Attribute {
  Attribute(name, react.to_dynamic(value))
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
