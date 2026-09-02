//// Still TSX: its diagrams need framer-motion, which moves in its own PR.

import blog/post.{type Post, Post}
import gleam/javascript/array.{type Array}
import react.{type Element}

pub fn post() -> Post {
  Post(
    name: name(),
    slug: slug(),
    date: date(),
    hidden: hidden(),
    excerpt: excerpt(),
    keywords: array.to_list(keywords()),
    body: body,
  )
}

@external(javascript, "./railways_ffi.ts", "name")
fn name() -> String

@external(javascript, "./railways_ffi.ts", "slug")
fn slug() -> String

@external(javascript, "./railways_ffi.ts", "date")
fn date() -> Int

@external(javascript, "./railways_ffi.ts", "hidden")
fn hidden() -> Bool

@external(javascript, "./railways_ffi.ts", "excerpt")
fn excerpt() -> String

@external(javascript, "./railways_ffi.ts", "keywords")
fn keywords() -> Array(String)

@external(javascript, "./railways_ffi.ts", "body")
fn body() -> Element
