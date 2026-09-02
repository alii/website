//// A page module exports `view(props) -> Element` and, if it has data,
//// `props() -> Codec(Props)`. Rendered at build time: `load(params)` returning
//// `Loaded`, plus `params()` and `paths()` when the route has parameters.
//// Rendered per request: `respond(request)` returning `page/server.Response`.

import gleam/option.{type Option}

pub type Loaded(props) {
  Found(props: props, revalidate: Option(Int))
  NotFound
}

pub type Paths(params) {
  Paths(prerender: List(params), others: Others)
}

pub type Others {
  RenderOnDemand
  ServeNotFound
  ServePlaceholder
}

pub fn prerender(paths: List(params), others others: Others) -> Paths(params) {
  Paths(prerender: paths, others:)
}
