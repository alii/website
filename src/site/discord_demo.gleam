//// A Discord user, as the OAuth demo's session JWT stores it.

import gleam/option.{type Option}

pub type User

@external(javascript, "./discord_demo_ffi.ts", "id")
pub fn id(user: User) -> String

@external(javascript, "./discord_demo_ffi.ts", "username")
pub fn username(user: User) -> String

@external(javascript, "./discord_demo_ffi.ts", "discriminator")
pub fn discriminator(user: User) -> String

/// Avatar hash, if the user has one.
@external(javascript, "./discord_demo_ffi.ts", "avatar")
pub fn avatar(user: User) -> Option(String)

/// Which of Discord's default avatars a user without one gets. Snowflakes
/// are too big for a JS number, so this stays in TS with BigInt.
@external(javascript, "./discord_demo_ffi.ts", "defaultAvatarIndex")
pub fn default_avatar_index(id: String) -> Int
