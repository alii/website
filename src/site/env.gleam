//// Server-side environment, from `src/server/env.ts`. Server only.

@external(javascript, "./env_ffi.mjs", "defaultLocation")
pub fn default_location() -> String
