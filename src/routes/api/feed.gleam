//// `/feed.xml`

import api.{type Response}
import blog/post.{type Post}
import gleam/list
import gleam/string
import site/date
import site/posts

pub fn get() -> Response {
  let visible = posts.all() |> posts.sort |> posts.visible
  let latest = case visible {
    [first, ..] -> date.http(first.date)
    [] -> date.http(0)
  }
  let feed =
    [
      "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
      "<rss version=\"2.0\" xmlns:atom=\"http://www.w3.org/2005/Atom\">",
      "\t<channel>",
      "\t\t<title>Alistair Smith</title>",
      "\t\t<link>https://alistair.sh</link>",
      "\t\t<description>Blog posts by Alistair Smith</description>",
      "\t\t<language>en</language>",
      "\t\t<lastBuildDate>" <> latest <> "</lastBuildDate>",
      "\t\t<atom:link href=\"https://alistair.sh/feed.xml\" rel=\"self\" type=\"application/rss+xml\"/>",
      visible |> list.map(item) |> string.join("\n"),
      "\t</channel>",
      "</rss>",
      "",
    ]
    |> string.join("\n")
  api.text(200, "application/rss+xml; charset=utf-8", feed)
}

fn item(post: Post) -> String {
  let link = "https://alistair.sh/" <> post.slug
  [
    "\t\t<item>",
    "\t\t\t<title>" <> escape(post.name) <> "</title>",
    "\t\t\t<link>" <> link <> "</link>",
    "\t\t\t<guid isPermaLink=\"true\">" <> link <> "</guid>",
    "\t\t\t<pubDate>" <> date.http(post.date) <> "</pubDate>",
    "\t\t\t<description>" <> escape(post.excerpt) <> "</description>",
    "\t\t</item>",
  ]
  |> string.join("\n")
}

fn escape(text: String) -> String {
  text
  |> string.replace("&", "&amp;")
  |> string.replace("\"", "&quot;")
  |> string.replace("'", "&#39;")
  |> string.replace("<", "&lt;")
  |> string.replace(">", "&gt;")
}
