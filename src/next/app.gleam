import react.{type Component, type Props}

pub type AppProps

@external(javascript, "./next_ffi.ts", "component")
pub fn component(props: AppProps) -> Component

@external(javascript, "./next_ffi.ts", "pageProps")
pub fn page_props(props: AppProps) -> Props
