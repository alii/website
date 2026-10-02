import gleam/javascript/promise.{type Promise}
import gleam/option.{type Option}
import js.{type Nullable}

pub type Presence

@external(javascript, "./lanyard_ffi.ts", "get")
fn fetch(id: String) -> Promise(Presence)

pub fn get(id: String) -> Promise(Option(Presence)) {
  js.attempt(fetch(id))
  |> promise.map(option.from_result)
}

@external(javascript, "./lanyard_ffi.ts", "location")
fn location_raw(presence: Presence) -> Nullable(String)

pub fn location(presence: Presence) -> Option(String) {
  js.to_option(location_raw(presence))
}
