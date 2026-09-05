//// Server only.

@external(javascript, "./env_ffi.ts", "isDevelopment")
pub fn is_development() -> Bool

@external(javascript, "./env_ffi.ts", "defaultLocation")
pub fn default_location() -> String

@external(javascript, "./env_ffi.ts", "turnstileSecretKey")
pub fn turnstile_secret_key() -> String

@external(javascript, "./env_ffi.ts", "discordWebhook")
pub fn discord_webhook() -> String

@external(javascript, "./env_ffi.ts", "appleTeamId")
pub fn apple_team_id() -> String

@external(javascript, "./env_ffi.ts", "appleKeyId")
pub fn apple_key_id() -> String

@external(javascript, "./env_ffi.ts", "applePrivateKey")
pub fn apple_private_key() -> String

@external(javascript, "./env_ffi.ts", "discordDemoClientId")
pub fn discord_demo_client_id() -> String

@external(javascript, "./env_ffi.ts", "discordDemoClientSecret")
pub fn discord_demo_client_secret() -> String

@external(javascript, "./env_ffi.ts", "discordDemoRedirectUri")
pub fn discord_demo_redirect_uri() -> String
