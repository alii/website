//// Discord presence via Lanyard (`use-lanyard`).

import gleam/javascript/promise.{type Promise}
import gleam/option.{type Option}
import js.{type Nullable}

pub type Presence

pub type Spotify

/// What `use_lanyard` returns: presences keyed by Discord id.
pub type PresenceMap

/// Fetch a presence over REST. `null` when the request fails, so it can be
/// handed straight to Next as a page prop.
@external(javascript, "./lanyard_ffi.ts", "get")
pub fn get(id: String) -> Promise(Nullable(Presence))

/// The `useLanyard` hook: live presences over a socket, seeded with initial data.
@external(javascript, "./lanyard_ffi.ts", "useLanyard")
pub fn use_lanyard(
  ids: List(String),
  initial: List(#(String, Option(Presence))),
) -> PresenceMap

@external(javascript, "./lanyard_ffi.ts", "presence")
pub fn presence(map: PresenceMap, id: String) -> Option(Presence)

@external(javascript, "./lanyard_ffi.ts", "spotify")
pub fn spotify(presence: Presence) -> Option(Spotify)

/// The `location` key in the presence's KV store.
@external(javascript, "./lanyard_ffi.ts", "location")
pub fn location(presence: Presence) -> Option(String)

@external(javascript, "./lanyard_ffi.ts", "trackId")
pub fn track_id(spotify: Spotify) -> String

@external(javascript, "./lanyard_ffi.ts", "song")
pub fn song(spotify: Spotify) -> String

@external(javascript, "./lanyard_ffi.ts", "artist")
pub fn artist(spotify: Spotify) -> Option(String)
