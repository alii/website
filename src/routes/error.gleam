//// `pages/_error`.

import attribute as a
import html
import react.{type Element}

pub fn view() -> Element {
  html.main([a.class("mx-auto max-w-3xl px-6 pt-16 pb-40")], [
    html.p([a.class("font-serif text-3xl italic")], [html.text("Uh oh...")]),
    html.p([], [html.text("Apologies, something went wrong there...")]),
  ])
}
