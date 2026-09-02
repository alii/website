import attribute as a
import gleam/int
import gleam/javascript/array.{type Array}
import gleam/list
import html
import react.{type Element}
import site/date
import site/ui

pub type Post

@external(javascript, "./posts_ffi.ts", "all")
fn all_raw() -> Array(Post)

pub fn all() -> List(Post) {
  array.to_list(all_raw())
}

@external(javascript, "./posts_ffi.ts", "name")
pub fn name(post: Post) -> String

@external(javascript, "./posts_ffi.ts", "slug")
pub fn slug(post: Post) -> String

@external(javascript, "./posts_ffi.ts", "hidden")
pub fn hidden(post: Post) -> Bool

@external(javascript, "./posts_ffi.ts", "excerpt")
pub fn excerpt(post: Post) -> String

@external(javascript, "./posts_ffi.ts", "keywords")
fn keywords_raw(post: Post) -> Array(String)

pub fn keywords(post: Post) -> List(String) {
  array.to_list(keywords_raw(post))
}

@external(javascript, "./posts_ffi.ts", "dateMs")
pub fn date_ms(post: Post) -> Int

@external(javascript, "./posts_ffi.ts", "render")
pub fn render(post: Post) -> Element

/// Newest first.
pub fn sort(posts: List(Post)) -> List(Post) {
  list.sort(posts, fn(a, b) { int.compare(date_ms(b), date_ms(a)) })
}

pub fn visible(posts: List(Post)) -> List(Post) {
  list.filter(posts, fn(post) { !hidden(post) })
}

pub fn find(wanted: String) -> Result(Post, Nil) {
  list.find(all(), fn(post) { slug(post) == wanted })
}

pub fn listing(posts: List(Post)) -> Element {
  html.ol([a.class(ui.listing)], list.map(posts, listed))
}

fn listed(post: Post) -> Element {
  html.li([a.class(ui.thing), a.key(slug(post))], [
    html.a([a.href("/" <> slug(post))], [html.text(name(post))]),
    html.text(" "),
    html.span([a.class(ui.muted), a.suppress_hydration_warning(True)], [
      html.text("· "),
      html.text(date.month_year(date_ms(post))),
    ]),
  ])
}
