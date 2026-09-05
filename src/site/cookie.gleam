import gleam/list
import gleam/string
import site/date
import site/env

pub type SameSite {
  Lax
  Strict
}

/// A `Set-Cookie` value: HTTP-only, site-wide, secure outside development.
pub fn set(
  name: String,
  value: String,
  expires expires: Int,
  same_site same_site: SameSite,
) -> String {
  [
    name <> "=" <> value,
    "Path=/",
    "Expires=" <> date.http(expires),
    "HttpOnly",
    ..list.append(
      case env.is_development() {
        True -> []
        False -> ["Secure"]
      },
      [
        "SameSite="
        <> case same_site {
          Lax -> "Lax"
          Strict -> "Strict"
        },
      ],
    )
  ]
  |> string.join("; ")
}
