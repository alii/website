//// Discord presence via Lanyard (`use-lanyard`).

import gleam/javascript/array.{type Array}
import gleam/javascript/promise.{type Promise}
import gleam/list
import gleam/option.{type Option, None, Some}
import js.{type Nullable, type Object}

pub type Presence

pub type Spotify

/// What `use_lanyard` returns: presences keyed by Discord id.
pub type PresenceMap

@external(javascript, "./lanyard_ffi.ts", "get")
fn fetch(id: String) -> Promise(Presence)

/// Fetch a presence over REST. `None` when the request fails.
pub fn get(id: String) -> Promise(Option(Presence)) {
  fetch(id)
  |> promise.map(Some)
  |> promise.rescue(fn(_) { None })
}

@external(javascript, "./lanyard_ffi.ts", "useLanyard")
fn use_lanyard_hook(ids: Array(String), initial_data: Object) -> PresenceMap

/// The `useLanyard` hook: live presences over a socket, seeded with initial data.
pub fn use_lanyard(
  ids: List(String),
  initial: List(#(String, Option(Presence))),
) -> PresenceMap {
  let initial_data =
    list.filter_map(initial, fn(pair) {
      case pair {
        #(id, Some(presence)) -> Ok(#(id, js.dynamic(presence)))
        #(_, None) -> Error(Nil)
      }
    })
  use_lanyard_hook(array.from_list(ids), js.object(initial_data))
}

@external(javascript, "./lanyard_ffi.ts", "presence")
fn presence_raw(map: PresenceMap, id: String) -> Nullable(Presence)

pub fn presence(map: PresenceMap, id: String) -> Option(Presence) {
  js.to_option(presence_raw(map, id))
}

@external(javascript, "./lanyard_ffi.ts", "spotify")
fn spotify_raw(presence: Presence) -> Nullable(Spotify)

pub fn spotify(presence: Presence) -> Option(Spotify) {
  js.to_option(spotify_raw(presence))
}

@external(javascript, "./lanyard_ffi.ts", "location")
fn location_raw(presence: Presence) -> Nullable(String)

/// The `location` key in the presence's KV store.
pub fn location(presence: Presence) -> Option(String) {
  js.to_option(location_raw(presence))
}

@external(javascript, "./lanyard_ffi.ts", "trackId")
pub fn track_id(spotify: Spotify) -> String

@external(javascript, "./lanyard_ffi.ts", "song")
pub fn song(spotify: Spotify) -> String

@external(javascript, "./lanyard_ffi.ts", "artist")
fn artist_raw(spotify: Spotify) -> Nullable(String)

pub fn artist(spotify: Spotify) -> Option(String) {
  js.to_option(artist_raw(spotify))
}
