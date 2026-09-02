import attribute as a
import blog/post.{type Post}
import blog/posts
import gleam/int
import gleam/list
import html
import react.{type Element}
import site/date
import site/ui

pub fn all() -> List(Post) {
  posts.all()
}

/// Newest first.
pub fn sort(posts: List(Post)) -> List(Post) {
  list.sort(posts, fn(a, b) { int.compare(b.date, a.date) })
}

pub fn visible(posts: List(Post)) -> List(Post) {
  list.filter(posts, fn(post) { !post.hidden })
}

pub fn find(slug: String) -> Result(Post, Nil) {
  list.find(all(), fn(post) { post.slug == slug })
}

pub fn listing(posts: List(Post)) -> Element {
  html.ol([a.class(ui.listing)], list.map(posts, listed))
}

fn listed(post: Post) -> Element {
  html.li([a.class(ui.thing), a.key(post.slug)], [
    html.a([a.href("/" <> post.slug)], [html.text(post.name)]),
    html.text(" "),
    html.span([a.class(ui.muted), a.suppress_hydration_warning(True)], [
      html.text("· "),
      html.text(date.month_year(post.date)),
    ]),
  ])
}
