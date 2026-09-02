import attribute as a
import gleam/int
import gleam/list
import gleam/option.{None, Some}
import gleam/string
import html
import react.{type Element}
import site/icons

pub type Language {
  TypeScript
  JavaScript
  Bash
  Json
  Css
  Html
  Markdown
  Gleam
  Rust
}

pub type Extra {
  Filename(String)
  Footer(Element)
}

@external(javascript, "./code_ffi.ts", "highlight")
fn highlight(source: String, language: String) -> String

/// A highlighted code block.
pub fn block(
  source: String,
  language: Language,
  extras: List(Extra),
) -> Element {
  let source = case string.ends_with(source, "\n") {
    True -> string.drop_end(source, 1)
    False -> source
  }
  let filename =
    list.find_map(extras, fn(extra) {
      case extra {
        Filename(name) -> Ok(name)
        Footer(_) -> Error(Nil)
      }
    })
  let footer =
    list.find_map(extras, fn(extra) {
      case extra {
        Footer(element) -> Ok(element)
        Filename(_) -> Error(Nil)
      }
    })

  html.div(
    [
      a.class(
        "not-prose my-5 overflow-hidden rounded-lg border border-stone-200 text-[12.5px] dark:border-stone-800",
      ),
    ],
    [
      case filename {
        Ok(name) -> filename_bar(name)
        Error(Nil) -> react.none()
      },
      html.div([a.inner_html(highlight(source, language_id(language)))], []),
      case footer {
        Ok(element) ->
          html.p(
            [
              a.class(
                "px-4 py-1.5 font-sans text-xs [&_code]:rounded-xs [&_code]:bg-neutral-200 [&_code]:px-0.5 dark:[&_code]:bg-neutral-800",
              ),
            ],
            [element],
          )
        Error(Nil) -> react.none()
      },
    ],
  )
}

fn language_id(language: Language) -> String {
  case language {
    TypeScript -> "typescript"
    JavaScript -> "javascript"
    Bash -> "bash"
    Json -> "json"
    Css -> "css"
    Html -> "html"
    Markdown -> "markdown"
    Gleam -> "gleam"
    Rust -> "rust"
  }
}

fn filename_bar(filename: String) -> Element {
  let has = fn(suffix) { string.ends_with(filename, suffix) }
  let icon = case
    has(".ts"),
    has(".js") || has(".mjs"),
    has(".html"),
    has(".css"),
    has(".gleam")
  {
    True, _, _, _, _ -> Some(icons.tb_brand_typescript("inline"))
    _, True, _, _, _ -> Some(icons.ri_javascript_fill("inline"))
    _, _, True, _, _ -> Some(icons.tb_brand_html5("inline"))
    _, _, _, True, _ -> Some(icons.tb_brand_css3("inline"))
    _, _, _, _, True -> Some(icons.si_gleam("inline"))
    _, _, _, _, _ -> None
  }
  html.p(
    [
      a.class(
        "m-0 border-b border-stone-200 bg-stone-100 px-3 py-1.5 font-mono text-xs text-stone-500 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400",
      ),
    ],
    [
      case icon {
        Some(icon) -> html.span([a.class("mr-2")], [icon])
        None -> react.none()
      },
      html.span([], [html.text(filename)]),
    ],
  )
}

/// A shell session, one line per `<p>`, with a `$` before the prompt lines.
pub fn shell(
  source: String,
  dollar_on_first_line_only dollar_on_first_line_only: Bool,
) -> Element {
  html.pre(
    [a.class("px-4")],
    list.index_map(string.split(source, "\n"), fn(line, index) {
      let class = case dollar_on_first_line_only, index {
        True, 0 ->
          "my-0! before:select-none text-yellow-800 before:text-yellow-600 before:content-[\"$_\"] dark:text-yellow-200 dark:before:text-yellow-400"
        True, _ -> "my-0! before:select-none"
        False, _ -> "my-0! before:select-none before:content-[\"$_\"]"
      }
      html.p([a.key(int.to_string(index)), a.class(class)], [
        case line {
          "" -> html.br([])
          _ -> html.text(line)
        },
      ])
    }),
  )
}
