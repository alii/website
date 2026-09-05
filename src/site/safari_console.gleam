//// A static imitation of Safari's Web Inspector console: one evaluated input
//// and the rows it produced. Colours follow Safari's own light and dark
//// inspector themes.

import attribute as a
import gleam/list
import gleam/option.{type Option, None, Some}
import html
import react.{type Element}
import site/mac_window.{rule}
import svg

pub type Row {
  ErrorRow(List(Element))
  LogRow(List(Element))
  ResultRow(List(Element))
}

const mono = "font-[Menlo,Monaco,ui-monospace,monospace] text-[12px] leading-[1.5] [font-variant-ligatures:none]"

type Direction {
  Left
  Right
}

fn chevron(dir: Direction, class: Option(String)) -> Element {
  svg.svg(
    [
      a.attr("viewBox", "0 0 12 12"),
      a.class(case class {
        Some(class) -> "mt-[3px] size-3 shrink-0 " <> class
        None -> "mt-[3px] size-3 shrink-0"
      }),
      a.flag("aria-hidden", True),
    ],
    [
      svg.path(
        [
          a.attr("d", case dir {
            Right -> "M4 2 L8.5 6 L4 10"
            Left -> "M8 2 L3.5 6 L8 10"
          }),
          a.attr("fill", "none"),
          a.attr("stroke", "currentColor"),
          a.attr("strokeWidth", "2"),
          a.attr("strokeLinecap", "round"),
          a.attr("strokeLinejoin", "round"),
        ],
        [],
      ),
    ],
  )
}

fn triangle() -> Element {
  svg.svg(
    [
      a.attr("viewBox", "0 0 12 12"),
      a.class("mt-[3px] size-3 shrink-0 fill-[#7a7a7a] dark:fill-[#9a9a9a]"),
      a.flag("aria-hidden", True),
    ],
    [svg.path([a.attr("d", "M3 1.5 L10 6 L3 10.5 Z")], [])],
  )
}

fn error_icon() -> Element {
  svg.svg(
    [
      a.attr("viewBox", "0 0 12 12"),
      a.class("mt-[3px] size-3 shrink-0"),
      a.flag("aria-hidden", True),
    ],
    [
      svg.circle(
        [
          a.attr("cx", "6"),
          a.attr("cy", "6"),
          a.attr("r", "6"),
          a.class("fill-[#e0241b] dark:fill-[#ff453a]"),
        ],
        [],
      ),
      svg.path(
        [
          a.attr("d", "M6 2.6 V7"),
          a.attr("stroke", "white"),
          a.attr("strokeWidth", "1.8"),
          a.attr("strokeLinecap", "round"),
        ],
        [],
      ),
      svg.circle(
        [
          a.attr("cx", "6"),
          a.attr("cy", "9.2"),
          a.attr("r", "1"),
          a.attr("fill", "white"),
        ],
        [],
      ),
    ],
  )
}

fn log_icon() -> Element {
  svg.svg(
    [
      a.attr("viewBox", "0 0 12 12"),
      a.class("mt-[3px] size-3 shrink-0 stroke-[#7a7a7a] dark:stroke-[#9a9a9a]"),
      a.attr("fill", "none"),
      a.attr("strokeWidth", "1.5"),
      a.attr("strokeLinecap", "round"),
      a.flag("aria-hidden", True),
    ],
    [svg.path([a.attr("d", "M2 3 H10 M2 6 H10 M2 9 H7")], [])],
  )
}

pub fn console(
  title: Option(String),
  code: String,
  rows: List(Row),
) -> Element {
  html.figure([a.class("not-prose my-8")], [
    mac_window.window(
      option.unwrap(title, "Safari"),
      [
        html.div([a.class(mono <> " text-[#1d1d1f] dark:text-[#e6e6e6]")], [
          html.div(
            [a.class("flex items-start gap-2 border-b px-3 py-2 " <> rule)],
            [
              chevron(Right, Some("text-[#7a7a7a] dark:text-[#9a9a9a]")),
              html.pre(
                [
                  a.class(
                    mono
                    <> " m-0 overflow-x-auto whitespace-pre text-[#2a59c7] dark:text-[#7aa2ff]",
                  ),
                ],
                [html.text(code)],
              ),
            ],
          ),
          ..list.append(list.map(rows, row), [
            html.div([a.class("flex h-8 items-center gap-2 px-3")], [
              chevron(Right, Some("mt-0 text-[#2a7fff] dark:text-[#5aa2ff]")),
              html.span(
                [
                  a.class(
                    "-ml-1 inline-block h-[14px] w-px bg-[#1d1d1f] dark:bg-[#e6e6e6]",
                  ),
                ],
                [],
              ),
            ]),
          ])
        ]),
      ],
      right: None,
      class: None,
    ),
  ])
}

fn row(row: Row) -> Element {
  case row {
    ErrorRow(children) ->
      html.div(
        [
          a.class(
            "flex items-start gap-2 border-b bg-[#fdf1f1] px-3 py-1.5 text-[#c0251c] dark:bg-[#3a2626] dark:text-[#ff7b72] "
            <> rule,
          ),
        ],
        [error_icon(), triangle(), html.span([], children)],
      )
    LogRow(children) ->
      html.div(
        [a.class("flex items-start gap-2 border-b px-3 py-1.5 " <> rule)],
        [
          log_icon(),
          html.span([], children),
        ],
      )
    ResultRow(children) ->
      html.div(
        [a.class("flex items-start gap-2 border-b px-3 py-1.5 " <> rule)],
        [
          chevron(Left, Some("text-[#9a9a9a] dark:text-[#7a7a7a]")),
          triangle(),
          html.span([], children),
        ],
      )
  }
}
