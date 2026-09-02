//// `pages/[slug]`: one blog post.

import attribute as a
import gleam/javascript/promise.{type Promise}
import gleam/list
import gleam/option.{None, Some}
import gleam/string
import html
import next/head
import next/link
import next/page.{type StaticPaths, type StaticProps, type StaticPropsContext}
import react.{type Element}
import site/date
import site/layout
import site/note
import site/posts
import site/ui

pub type Props {
  Props(slug: String)
}

pub type Params {
  Params(slug: String)
}

pub fn page(props: Props) -> Element {
  let assert Ok(post) = posts.find(props.slug)
  let name = posts.name(post)
  let excerpt = posts.excerpt(post)
  let og_image = "https://alistair.sh/api/og?slug=" <> posts.slug(post)
  let theme_color = case posts.hidden(post) {
    True -> "#ebb305"
    False -> "#ffffff"
  }

  layout.layout([
    head.head([
      html.title([], [html.text(name)]),
      html.meta([a.name("description"), a.content(excerpt)]),
      html.meta([
        a.name("keywords"),
        a.content(string.join(posts.keywords(post), ", ")),
      ]),
      html.meta([a.name("theme-color"), a.content(theme_color)]),
      html.meta([a.property("og:image"), a.content(og_image)]),
      html.meta([a.name("twitter:card"), a.content("summary_large_image")]),
      html.meta([a.name("twitter:title"), a.content(name)]),
      html.meta([a.name("twitter:description"), a.content(excerpt)]),
      html.meta([a.name("twitter:image"), a.content(og_image)]),
      html.meta([a.name("twitter:site"), a.content("@alistaiir")]),
      html.meta([a.name("twitter:creator"), a.content("@alistaiir")]),
    ]),
    case posts.hidden(post) {
      True ->
        note.note(note.Warning, "Hidden post", [
          html.p([], [
            html.text(
              "This post is not listed on the homepage. Please don't share the link.",
            ),
          ]),
        ])
      False -> react.none()
    },
    html.article([], [
      html.header([a.class("mb-12")], [
        html.h1([a.class("mb-2 leading-tight " <> ui.page_title)], [
          html.text(name),
        ]),
        html.p([a.class("text-[13px] " <> ui.muted)], [
          html.text(date.format_utc(posts.date_ms(post))),
        ]),
      ]),
      html.div([a.class(prose())], [posts.render(post)]),
      html.footer([a.class("mt-16 text-[15px]")], [
        link.link([a.href("/")], [html.text("← Home")]),
      ]),
    ]),
  ])
}

/// Classes for the post body.
fn prose() -> String {
  string.join(
    [
      // serif body for long-form reading; the rest of the site stays sans.
      // tracking resets to normal: the body's tightened letter-spacing is
      // tuned for Karla and cramps Lora at reading size
      "prose prose-stone dark:prose-invert max-w-none font-serif text-[17px] tracking-normal",
      // the post body renders its own <h1> title; we already show it in the
      // header above, so hide the duplicate leading heading
      "[&>h1:first-child]:hidden",
      "prose-headings:font-serif prose-headings:font-semibold",
      // inline code: no backticks, a faint pill instead
      "prose-code:rounded prose-code:bg-stone-900/[0.06] prose-code:px-1 prose-code:py-0.5 prose-code:font-normal prose-code:before:content-none prose-code:after:content-none dark:prose-code:bg-white/10",
      "prose-img:w-full",
      // the prose plugin's default pre color is pale gray meant for a dark
      // background; we make pre transparent, so give it readable text again
      "prose-pre:bg-transparent prose-pre:p-0 prose-pre:text-stone-700 dark:prose-pre:text-stone-300",
      // wide content must scroll inside the column, not the page
      "[&_table]:block [&_table]:overflow-x-auto [&_video]:w-full",
      "prose-a:text-orange-800 prose-a:decoration-orange-800/40 prose-a:underline-offset-2 dark:prose-a:text-orange-300 dark:prose-a:decoration-orange-300/40",
      // hover must target the LINK, not the prose container:
      // hover:prose-a:* binds :hover to .prose and lights up every link at once
      "[&_a:hover]:decoration-orange-800 dark:[&_a:hover]:decoration-orange-300",
    ],
    " ",
  )
}

pub fn get_static_props(
  context: StaticPropsContext,
) -> Promise(StaticProps(Props)) {
  let found = case page.param(context, "slug") {
    Some(slug) -> posts.find(slug)
    None -> Error(Nil)
  }
  promise.resolve(case found {
    Ok(post) ->
      page.static_props(Props(slug: posts.slug(post)), revalidate: None)
    Error(Nil) -> page.not_found()
  })
}

pub fn get_static_paths(_context) -> Promise(StaticPaths) {
  posts.all()
  |> list.map(fn(post) { Params(slug: posts.slug(post)) })
  |> page.static_paths(page.Blocking)
  |> promise.resolve
}
