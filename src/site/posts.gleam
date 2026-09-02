//// Blog posts, from `src/blog/posts.ts`.

import gleam/int
import gleam/list
import js
import react.{type Element}

/// A `Post` class instance.
pub type Post

@external(javascript, "./posts_ffi.mjs", "all")
pub fn all() -> List(Post)

pub fn name(post: Post) -> String {
  js.get(post, "name")
}

pub fn slug(post: Post) -> String {
  js.get(post, "slug")
}

pub fn hidden(post: Post) -> Bool {
  js.get(post, "hidden")
}

@external(javascript, "./posts_ffi.mjs", "dateMs")
pub fn date_ms(post: Post) -> Int

/// Newest first.
pub fn sort(posts: List(Post)) -> List(Post) {
  list.sort(posts, fn(a, b) { int.compare(date_ms(b), date_ms(a)) })
}

pub fn visible(posts: List(Post)) -> List(Post) {
  list.filter(posts, fn(post) { !hidden(post) })
}

/// The existing TSX <PostListing>.
@external(javascript, "./posts_ffi.mjs", "postListing")
pub fn listing(posts: List(Post)) -> Element
