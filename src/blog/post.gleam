import react.{type Element}

pub type Post {
  Post(
    name: String,
    slug: String,
    /// Midnight UTC, in milliseconds since the Unix epoch.
    date: Int,
    hidden: Bool,
    excerpt: String,
    keywords: List(String),
    body: fn() -> Element,
  )
}
