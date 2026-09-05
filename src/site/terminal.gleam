//// A static imitation of a macOS Terminal window showing one command and its
//// output. `running` leaves the cursor blinking instead of handing the prompt
//// back, for programs that never finish.

import attribute as a
import gleam/list
import gleam/option.{None, Some}
import html
import react.{type Element}
import site/mac_window

pub type Line {
  Cmd(String)
  Out(String)
  Dim(String)
}

const mono = "font-[Menlo,Monaco,ui-monospace,monospace] text-[12px] leading-[1.55] [font-variant-ligatures:none]"

pub fn terminal(
  title: String,
  lines: List(Line),
  running running: Bool,
) -> Element {
  mac_window.window(
    title,
    [
      html.pre(
        [
          a.class(
            mono
            <> " m-0 flex-1 overflow-x-auto bg-white px-3.5 py-2.5 whitespace-pre text-[#1d1d1f] dark:bg-[#1e1e1e] dark:text-[#e6e6e6]",
          ),
        ],
        list.append(list.map(lines, line), [prompt(running)]),
      ),
    ],
    right: None,
    class: Some("h-full w-full"),
  )
}

fn line(line: Line) -> Element {
  case line {
    Out("") -> html.div([], [html.text(" ")])
    Out(text) -> html.div([], [html.text(text)])
    Cmd(text) ->
      html.div([], [
        html.span([a.class("text-amber-700 dark:text-amber-300")], [
          html.text("$ "),
        ]),
        html.span([a.class("text-yellow-900 dark:text-yellow-100")], [
          html.text(text),
        ]),
      ])
    Dim(text) -> html.div([a.class("text-stone-500")], [html.text(text)])
  }
}

fn prompt(running: Bool) -> Element {
  case running {
    True ->
      html.div([], [
        html.span(
          [
            a.class(
              "inline-block h-[14px] w-[7px] translate-y-[2px] animate-pulse bg-current",
            ),
          ],
          [],
        ),
      ])
    False ->
      html.div([], [
        html.span([a.class("text-amber-700 dark:text-amber-300")], [
          html.text("$ "),
        ]),
        html.span(
          [
            a.class(
              "inline-block h-[14px] w-[7px] translate-y-[2px] bg-current",
            ),
          ],
          [],
        ),
      ])
  }
}
