//// The posts are TSX; `src/blog/posts.ts` owns them and their metadata.

import gleam/int
import gleam/javascript/array.{type Array}
import gleam/list

pub type Post {
  Post(
    name: String,
    slug: String,
    /// Milliseconds since the Unix epoch.
    date: Int,
    hidden: Bool,
    excerpt: String,
    keywords: List(String),
  )
}

type Source

@external(javascript, "./posts_ffi.ts", "all")
fn all_raw() -> Array(Source)

@external(javascript, "./posts_ffi.ts", "name")
fn name(post: Source) -> String

@external(javascript, "./posts_ffi.ts", "slug")
fn slug(post: Source) -> String

@external(javascript, "./posts_ffi.ts", "date")
fn date(post: Source) -> Int

@external(javascript, "./posts_ffi.ts", "hidden")
fn hidden(post: Source) -> Bool

@external(javascript, "./posts_ffi.ts", "excerpt")
fn excerpt(post: Source) -> String

@external(javascript, "./posts_ffi.ts", "keywords")
fn keywords(post: Source) -> Array(String)

pub fn all() -> List(Post) {
  all_raw()
  |> array.to_list
  |> list.map(fn(post) {
    Post(
      name: name(post),
      slug: slug(post),
      date: date(post),
      hidden: hidden(post),
      excerpt: excerpt(post),
      keywords: array.to_list(keywords(post)),
    )
  })
}

/// Newest first.
pub fn sort(posts: List(Post)) -> List(Post) {
  list.sort(posts, fn(a, b) { int.compare(b.date, a.date) })
}

pub fn visible(posts: List(Post)) -> List(Post) {
  list.filter(posts, fn(post) { !post.hidden })
}
