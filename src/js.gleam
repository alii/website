//// The JavaScript boundary. Values from JS are opaque types whose accessors
//// are externals in that type's own `*_ffi.ts`, typed against the real JS
//// type there. This module only bridges null.

import gleam/option.{type Option}

/// A JS value that may be `null` or `undefined`.
pub type Nullable(a)

@external(javascript, "./js_ffi.ts", "toOption")
pub fn to_option(value: Nullable(a)) -> Option(a)

@external(javascript, "./js_ffi.ts", "fromOption")
pub fn from_option(option: Option(a)) -> Nullable(a)
