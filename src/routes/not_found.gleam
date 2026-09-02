//// `pages/404`.

import attribute as a
import html
import next/link
import react.{type Element}
import site/layout
import site/ui

pub fn view() -> Element {
  layout.layout([
    html.h1([a.class("mb-4 " <> ui.page_title)], [html.text("404")]),
    html.p([a.class("mb-4 text-stone-500 dark:text-stone-400")], [
      html.text(
        "Sorry, I could not find that page. It may have moved or never existed.",
      ),
    ]),
    html.p([], [link.link([a.href("/")], [html.text("Go back home →")])]),
  ])
}
