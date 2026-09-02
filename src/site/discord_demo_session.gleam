//// Server only: reads the OAuth demo's session cookie. Kept apart from
//// `site/discord_demo` so the JWT secret never reaches the browser bundle.

import site/discord_demo.{type User}

/// Verify the session JWT. Throws on a bad token, like the original.
@external(javascript, "./discord_demo_session_ffi.ts", "verify")
pub fn verify(token: String) -> User
