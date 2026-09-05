import gleam/uri
import site/env

pub type Theme {
  Light
  Dark
}

/// A signed MapKit snapshot URL centred on `center`.
pub fn snapshot_url(center: String, theme: Theme) -> String {
  let query =
    uri.query_to_string([
      #("center", center),
      #("teamId", env.apple_team_id()),
      #("keyId", env.apple_key_id()),
      #("z", "13"),
      #("colorScheme", case theme {
        Light -> "light"
        Dark -> "dark"
      }),
      #("size", "340x200"),
      #("scale", "2"),
      #("t", "mutedStandard"),
      #("poi", "0"),
    ])
  let path = "/api/v1/snapshot?" <> query
  "https://snapshot.apple-mapkit.com"
  <> path
  <> "&signature="
  <> sign(path, env.apple_private_key())
}

@external(javascript, "./apple_maps_ffi.ts", "sign")
fn sign(message: String, private_key: String) -> String
