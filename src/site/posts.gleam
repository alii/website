//// Blog posts, from `src/blog/posts.ts`.

import gleam/int
import gleam/list
import react.{type Element}

/// A `Post` class instance.
pub type Post

@external(javascript, "./posts_ffi.ts", "all")
pub fn all() -> List(Post)

@external(javascript, "./posts_ffi.ts", "name")
pub fn name(post: Post) -> String

@external(javascript, "./posts_ffi.ts", "slug")
pub fn slug(post: Post) -> String

@external(javascript, "./posts_ffi.ts", "hidden")
pub fn hidden(post: Post) -> Bool

@external(javascript, "./posts_ffi.ts", "excerpt")
pub fn excerpt(post: Post) -> String

@external(javascript, "./posts_ffi.ts", "keywords")
pub fn keywords(post: Post) -> List(String)

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

/// The existing TSX <PostListing>.
@external(javascript, "./posts_ffi.ts", "postListing")
pub fn listing(posts: List(Post)) -> Element
