//// Helpers for the JavaScript boundary.

import gleam/option.{type Option}

/// A JS value that may be `null` or `undefined`.
pub type Nullable(a)

@external(javascript, "./js_ffi.ts", "toOption")
pub fn to_option(value: Nullable(a)) -> Option(a)

@external(javascript, "./js_ffi.ts", "fromOption")
pub fn from_option(option: Option(a)) -> Nullable(a)

/// Read a property off a JS object. Unchecked: the caller picks the type,
/// so keep calls inside a binding module that knows the object's shape.
@external(javascript, "./js_ffi.ts", "get")
pub fn get(object: a, property: String) -> b

pub fn get_optional(object: a, property: String) -> Option(b) {
  to_option(get(object, property))
}
