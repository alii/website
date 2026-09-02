//// `pages/_app`: what Next passes to the app component.

import react.{type Component, type Props}

pub type AppProps

/// The page component Next chose for this route.
@external(javascript, "./app_ffi.ts", "component")
pub fn component(props: AppProps) -> Component

/// The props for that page, from `get_static_props` and friends.
@external(javascript, "./app_ffi.ts", "pageProps")
pub fn page_props(props: AppProps) -> Props
