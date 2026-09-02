//// The JavaScript boundary. Values from JS are opaque types whose accessors
//// are externals in that type's own `*_ffi.ts`. Every external is one small
//// pure function: read a field, call one library function, or build one JS
//// value. Conversions and logic live in Gleam.

import gleam/dynamic.{type Dynamic}
import gleam/option.{type Option}

/// A JS value that may be `null` or `undefined`.
pub type Nullable(a)

@external(javascript, "./js_ffi.ts", "toOption")
pub fn to_option(value: Nullable(a)) -> Option(a)

@external(javascript, "./js_ffi.ts", "fromOption")
pub fn from_option(option: Option(a)) -> Nullable(a)

/// A plain JS object, as Next and React want them.
pub type Object

/// `{name: value, ...}`
@external(javascript, "./js_ffi.ts", "object")
pub fn object(fields: List(#(String, Dynamic))) -> Object

/// `{...record}`: a record's fields as a plain object.
@external(javascript, "./js_ffi.ts", "spread")
pub fn plain(record: a) -> Object

/// `{...base, ...extra}`
@external(javascript, "./js_ffi.ts", "merge")
pub fn merge(base: a, extra: Object) -> Object

/// Forget a value's type.
@external(javascript, "./js_ffi.ts", "identity")
pub fn dynamic(value: a) -> Dynamic

/// `JSON.stringify(value, null, indent)`. Nothing for `undefined`.
@external(javascript, "./js_ffi.ts", "json")
pub fn json(value: a, indent: Int) -> Nullable(String)
