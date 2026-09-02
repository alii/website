//// The pointer `pages/_app.gleam.mjs` imports the global CSS.

import attribute as a
import gleam/option.{None, Some}
import html
import next/app.{type AppProps}
import next/head
import react.{type Element}
import site/analytics

pub fn view(props: AppProps) -> Element {
  react.fragment([
    head.head([
      html.title([], [html.text("Alistair Smith")]),
      html.meta([
        a.content("width=device-width, initial-scale=1"),
        a.name("viewport"),
      ]),
      html.link([a.rel("icon"), a.href("/favicon.ico")]),
    ]),
    react.with_props(app.component(props), app.page_props(props)),
    analytics.toaster(),
    case analytics.gtm_id() {
      Some(tag) -> analytics.google_analytics(tag)
      None -> react.none()
    },
  ])
}
