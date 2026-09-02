//// Third-party bits used by `pages/_app`.

import gleam/option.{type Option}
import react.{type Element}

/// `NEXT_PUBLIC_GTM_ID`, inlined at build time.
@external(javascript, "./analytics_ffi.ts", "gtmId")
pub fn gtm_id() -> Option(String)

@external(javascript, "./analytics_ffi.ts", "googleAnalytics")
pub fn google_analytics(ga_id: String) -> Element

/// react-hot-toast's <Toaster />
@external(javascript, "./analytics_ffi.ts", "toaster")
pub fn toaster() -> Element
