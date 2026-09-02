import attribute as a
import html
import next/document
import react.{type Element}

pub fn view() -> Element {
  document.html([], [
    document.head([], [
      html.link([
        a.rel("alternate"),
        a.type_("application/rss+xml"),
        a.title("Alistair Smith"),
        a.href("/feed.xml"),
      ]),
      preload_font("/fonts/karla-latin.woff2"),
      preload_font("/fonts/lora-latin.woff2"),
      preload_font("/fonts/iosevka-latin-400.woff2"),
    ]),
    html.body([], [
      document.main(),
      document.next_script(),
      html.script([
        a.async(True),
        a.defer(True),
        a.src("https://lab.alistair.cloud/latest.js"),
      ]),
      html.script([
        a.defer(True),
        a.src("https://assets.onedollarstats.com/stonks.js"),
      ]),
      html.script([
        a.inner_html(
          "if(\"paintWorklet\" in CSS)CSS.paintWorklet.addModule(\"https://www.unpkg.com/css-houdini-squircle@0.3.0/squircle.min.js\")",
        ),
      ]),
    ]),
  ])
}

fn preload_font(href: String) -> Element {
  html.link([
    a.rel("preload"),
    a.href(href),
    a.as_("font"),
    a.type_("font/woff2"),
    a.cross_origin("anonymous"),
  ])
}
