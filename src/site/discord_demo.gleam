//// A Discord user, as the OAuth demo's session JWT stores it.

import codec.{type Codec}
import gleam/dynamic.{type Dynamic}
import gleam/dynamic/decode
import gleam/int
import gleam/json.{type Json}
import gleam/list
import gleam/option.{type Option}
import gleam/result
import gleam/string
import js.{type Nullable}

pub type User

@external(javascript, "./discord_demo_ffi.ts", "id")
pub fn id(user: User) -> String

@external(javascript, "./discord_demo_ffi.ts", "username")
pub fn username(user: User) -> String

@external(javascript, "./discord_demo_ffi.ts", "discriminator")
pub fn discriminator(user: User) -> String

@external(javascript, "./discord_demo_ffi.ts", "avatar")
fn avatar_raw(user: User) -> Nullable(String)

/// Avatar hash, if the user has one.
pub fn avatar(user: User) -> Option(String) {
  js.to_option(avatar_raw(user))
}

/// Which of Discord's six default avatars a user without one gets:
/// `(id >> 22) % 6`. A snowflake is too big for a JS number, so this is done
/// on the decimal digits: long division by 2^22, then the remainder mod 6.
pub fn default_avatar_index(id: String) -> Int {
  id
  |> string.to_graphemes
  |> list.map(fn(digit) { result.unwrap(int.parse(digit), 0) })
  |> divide(by: 4_194_304)
  |> modulo(6)
}

/// Quotient digits of a big decimal number divided by a small one.
fn divide(digits: List(Int), by divisor: Int) -> List(Int) {
  let #(_remainder, quotient) =
    list.map_fold(digits, 0, fn(carry, digit) {
      let n = carry * 10 + digit
      #(n % divisor, n / divisor)
    })
  quotient
}

fn modulo(digits: List(Int), m: Int) -> Int {
  list.fold(digits, 0, fn(acc, digit) { { acc * 10 + digit } % m })
}

/// A user is the JSON payload of the session token, unchanged, so it
/// crosses the server-to-browser boundary as itself.
pub fn codec() -> Codec(User) {
  codec.custom(encode: as_json, decoder: decode.map(decode.dynamic, from_json))
}

@external(javascript, "../js_ffi.ts", "identity")
fn as_json(value: User) -> Json

@external(javascript, "../js_ffi.ts", "identity")
fn from_json(json: Dynamic) -> User
