//// Third-party bits used by `pages/_app`.

import gleam/option.{type Option}
import js.{type Nullable}
import react.{type Element}

@external(javascript, "./analytics_ffi.ts", "gtmId")
fn gtm_id_raw() -> Nullable(String)

/// `NEXT_PUBLIC_GTM_ID`, inlined at build time.
pub fn gtm_id() -> Option(String) {
  js.to_option(gtm_id_raw())
}

@external(javascript, "./analytics_ffi.ts", "googleAnalytics")
pub fn google_analytics(ga_id: String) -> Element

/// react-hot-toast's <Toaster />
@external(javascript, "./analytics_ffi.ts", "toaster")
pub fn toaster() -> Element
