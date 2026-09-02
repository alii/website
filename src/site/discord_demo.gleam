//// A Discord user, as the OAuth demo's session JWT stores it.

import gleam/option.{type Option}
import js

pub type User

pub fn id(user: User) -> String {
  js.get(user, "id")
}

pub fn username(user: User) -> String {
  js.get(user, "username")
}

pub fn discriminator(user: User) -> String {
  js.get(user, "discriminator")
}

/// Avatar hash, if the user has one.
pub fn avatar(user: User) -> Option(String) {
  js.get_optional(user, "avatar")
}

/// Which of Discord's default avatars a user without one gets. Snowflakes
/// are too big for a JS number, so this stays in TS with BigInt.
@external(javascript, "./discord_demo_ffi.ts", "defaultAvatarIndex")
pub fn default_avatar_index(id: String) -> Int
