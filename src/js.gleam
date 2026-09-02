import gleam/dynamic.{type Dynamic}
import gleam/javascript/promise.{type Promise}
import gleam/option.{type Option}

pub type Nullable(a)

@external(javascript, "./js_ffi.ts", "toOption")
pub fn to_option(value: Nullable(a)) -> Option(a)

@external(javascript, "./js_ffi.ts", "fromOption")
pub fn from_option(option: Option(a)) -> Nullable(a)

@external(javascript, "./js_ffi.ts", "identity")
pub fn dynamic(value: a) -> Dynamic

@external(javascript, "./js_ffi.ts", "json")
pub fn json(value: a, indent: Int) -> Nullable(String)

pub type Thrown

@external(javascript, "./js_ffi.ts", "attempt")
pub fn attempt(promise: Promise(a)) -> Promise(Result(a, Thrown))
