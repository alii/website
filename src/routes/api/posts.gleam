import api.{type Request, type Response}
import blog/post.{type Post}
import gleam/http
import gleam/javascript/promise.{type Promise}
import gleam/json.{type Json}
import site/date
import site/posts

pub fn handle(request: Request) -> Promise(Response) {
  use <- api.only(request, http.Get)
  posts.all()
  |> posts.visible
  |> json.array(encode)
  |> api.ok
  |> promise.resolve
}

fn encode(post: Post) -> Json {
  json.object([
    #("name", json.string(post.name)),
    #("slug", json.string(post.slug)),
    #("date", json.string(date.iso(post.date))),
    #("hidden", json.bool(post.hidden)),
    #("excerpt", json.string(post.excerpt)),
    #("keywords", json.array(post.keywords, json.string)),
  ])
}
