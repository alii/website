//// Third-party bits used by `pages/_app`.

import attribute as a
import gleam/option.{type Option}
import react.{type Component, type Element}

/// `NEXT_PUBLIC_GTM_ID`, inlined at build time.
@external(javascript, "./analytics_ffi.ts", "gtmId")
pub fn gtm_id() -> Option(String)

@external(javascript, "./analytics_ffi.ts", "googleAnalytics")
fn google_analytics_component() -> Component

@external(javascript, "./analytics_ffi.ts", "toaster")
fn toaster_component() -> Component

pub fn google_analytics(ga_id: String) -> Element {
  react.component(google_analytics_component(), [a.attr("gaId", ga_id)], [])
}

/// react-hot-toast's <Toaster />
pub fn toaster() -> Element {
  react.component(toaster_component(), [], [])
}
