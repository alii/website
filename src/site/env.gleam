//// Server-side environment, from `src/server/env.ts`. Server only.

@external(javascript, "./env_ffi.ts", "defaultLocation")
pub fn default_location() -> String
