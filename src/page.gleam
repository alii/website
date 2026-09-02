//// What a page is, in Gleam terms. A page module exports some of:
////
//// - `view(props) -> Element`, always.
//// - `props() -> Codec(Props)`: the shape of its data, if it has any.
//// - `load(params) -> Promise(Loaded(Props))` for a page rendered at build
////   time, with `params() -> Codec(Params)` and
////   `paths() -> Promise(Paths(Params))` if the route has parameters.
//// - `respond(request) -> Promise(Response(Props))` for a page rendered on
////   the server for each request; see `page/server`.
////
//// `next/runtime` serves these through Next.

import gleam/option.{type Option}

/// What loading a page at build time produced.
pub type Loaded(props) {
  /// The page's data, and how many seconds until it is regenerated, if ever.
  Found(props: props, revalidate: Option(Int))
  NotFound
}

/// Which routes of a parameterised page to render at build time, and what to
/// do about any other route.
pub type Paths(params) {
  Paths(prerender: List(params), others: Others)
}

pub type Others {
  /// Render on the server on first request, then keep it.
  RenderOnDemand
  /// 404.
  ServeNotFound
  /// Serve a placeholder while it renders.
  ServePlaceholder
}

pub fn prerender(paths: List(params), others others: Others) -> Paths(params) {
  Paths(prerender: paths, others:)
}
