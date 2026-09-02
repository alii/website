import attribute as a
import gleam/option.{type Option, None, Some}
import html
import react.{type Element}
import site/icons

pub type Variant {
  Warning
  Info
  Success
}

pub fn note(
  variant: Variant,
  title: Option(String),
  children: List(Element),
) -> Element {
  html.div(
    [
      a.class(
        "not-prose my-6 border-l-2 py-0.5 pl-4 text-[15px] [&_a:hover]:underline "
        <> colours(variant),
      ),
    ],
    [
      case title {
        Some(title) ->
          html.div(
            [a.class("mb-1 text-[11px] font-bold tracking-wide uppercase")],
            [
              icon(variant),
              html.text(title),
            ],
          )
        None -> react.none()
      },
      html.div([a.class("[&_p]:m-0")], children),
    ],
  )
}

fn colours(variant: Variant) -> String {
  case variant {
    Warning ->
      "border-yellow-500 text-yellow-800 dark:border-yellow-600 dark:text-yellow-300"
    Info -> "border-sky-500 text-sky-800 dark:border-sky-600 dark:text-sky-300"
    Success ->
      "border-green-500 text-green-800 dark:border-green-600 dark:text-green-300"
  }
}

fn icon(variant: Variant) -> Element {
  let class = "mr-2 inline text-sm select-none"
  case variant {
    Warning -> icons.vsc_warning(class)
    Info -> icons.vsc_info(class)
    Success -> icons.vsc_check(class)
  }
}
