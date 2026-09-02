//// The JavaScript boundary. Values from JS are opaque types whose accessors
//// are externals in that type's own `*_ffi.ts`. Every external is one small
//// pure function: read a field, call one library function, or build one JS
//// value. Conversions and logic live in Gleam.

import gleam/dynamic.{type Dynamic}
import gleam/javascript/promise.{type Promise}
import gleam/option.{type Option}

/// A JS value that may be `null` or `undefined`.
pub type Nullable(a)

@external(javascript, "./js_ffi.ts", "toOption")
pub fn to_option(value: Nullable(a)) -> Option(a)

@external(javascript, "./js_ffi.ts", "fromOption")
pub fn from_option(option: Option(a)) -> Nullable(a)

/// Forget a value's type, for a place that takes any JS value, like a React
/// prop.
@external(javascript, "./js_ffi.ts", "identity")
pub fn dynamic(value: a) -> Dynamic

/// `JSON.stringify(value, null, indent)`. Nothing for `undefined`.
@external(javascript, "./js_ffi.ts", "json")
pub fn json(value: a, indent: Int) -> Nullable(String)

/// Whatever a JS promise rejected with.
pub type Thrown

/// Run a promise, catching a rejection instead of propagating it.
@external(javascript, "./js_ffi.ts", "attempt")
pub fn attempt(promise: Promise(a)) -> Promise(Result(a, Thrown))
