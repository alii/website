//// Blog posts, from `src/blog/posts.ts`.

import gleam/int
import gleam/javascript/array.{type Array}
import gleam/list
import react.{type Element}

/// A `Post` class instance.
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

/// Publication date, in milliseconds since the Unix epoch.
@external(javascript, "./posts_ffi.ts", "dateMs")
pub fn date_ms(post: Post) -> Int

/// The post body, a React tree.
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

@external(javascript, "./posts_ffi.ts", "postListing")
fn post_listing(posts: Array(Post)) -> Element

/// The existing TSX <PostListing>.
pub fn listing(posts: List(Post)) -> Element {
  post_listing(array.from_list(posts))
}
