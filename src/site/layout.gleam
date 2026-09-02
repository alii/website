import attribute as a
import gleam/int
import gleam/list
import html
import next/link
import react.{type Element}
import site/date
import site/ui

const footer_links = [
  #("/", "home"),
  #("https://github.com/alii/website", "github"),
  #("https://x.com/intent/user?screen_name=alistaiir", "twitter"),
  #("/feed.xml", "rss"),
]

pub fn layout(children: List(Element)) -> Element {
  html.div(
    [a.class(ui.wrap <> " flex min-h-screen flex-col py-20 max-sm:py-10")],
    [
      html.main([a.class("flex-1")], children),
      html.footer(
        [
          a.class(
            "mt-24 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-stone-400 dark:text-stone-500",
          ),
        ],
        [
          html.span([], [
            html.text("© "),
            html.text(int.to_string(date.current_year())),
            html.text(" Alistair Smith"),
          ]),
          ..list.map(footer_links, footer_link)
        ],
      ),
    ],
  )
}

fn footer_link(link: #(String, String)) -> Element {
  let #(href, label) = link
  link.link(
    [
      a.key(href),
      a.href(href),
      a.class("text-stone-400 no-underline hover:underline dark:text-stone-500"),
    ],
    [html.text(label)],
  )
}
