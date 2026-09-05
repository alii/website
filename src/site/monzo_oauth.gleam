//// Server only: the Monzo OAuth flow and the session cookie it ends in.

import gleam/javascript/promise.{type Promise}

/// A signed-in Monzo client.
pub type Client

@external(javascript, "./monzo_oauth_ffi.ts", "url")
pub fn url() -> String

@external(javascript, "./monzo_oauth_ffi.ts", "exchange")
pub fn exchange(code: String) -> Promise(Client)

/// The session JWT for a signed-in client.
@external(javascript, "./monzo_oauth_ffi.ts", "sessionToken")
pub fn session_token(client: Client) -> String
