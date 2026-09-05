//// A macOS 27 style window: traffic lights, a title, a hairline border, no
//// shadow. The traffic lights are real AppKit renders, once per appearance.

import attribute as a
import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/string
import html
import react.{type Element}

const system = "font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Text',system-ui,sans-serif]"

pub const rule = "border-[#e4e4e4] dark:border-[#3c3c3c]"

@external(javascript, "./mac_window_ffi.ts", "lightsLight")
fn lights_light() -> String

@external(javascript, "./mac_window_ffi.ts", "lightsDark")
fn lights_dark() -> String

pub fn traffic_lights() -> Element {
  react.fragment([
    html.img([
      a.src(lights_light()),
      a.alt(""),
      a.flag("draggable", False),
      a.class("h-4 w-auto shrink-0 select-none dark:hidden"),
    ]),
    html.img([
      a.src(lights_dark()),
      a.alt(""),
      a.flag("draggable", False),
      a.class("hidden h-4 w-auto shrink-0 select-none dark:block"),
    ]),
  ])
}

pub fn window(
  title: String,
  children: List(Element),
  right right: Option(String),
  class class: Option(String),
) -> Element {
  html.div(
    [
      a.class(
        [
          "mx-auto flex flex-col overflow-hidden rounded-lg bg-white dark:bg-[#262626]",
          "ring-1 ring-black/10 dark:ring-white/10",
        ]
        |> list.append(option.values([class]))
        |> string.join(" "),
      ),
    ],
    [
      html.div(
        [
          a.class(
            system
            <> " flex h-6 items-center gap-1.5 border-b bg-[#f3f3f3] px-2 text-[12px] text-[#6b6b6b] dark:bg-[#2e2e2e] dark:text-[#a9a9a9] "
            <> rule,
          ),
        ],
        [
          traffic_lights(),
          html.span(
            [
              a.class(
                "text-[12px] font-semibold text-[#3a3a3a] dark:text-[#e0e0e0]",
              ),
            ],
            [html.text(title)],
          ),
          case right {
            Some(right) -> html.span([a.class("ml-auto")], [html.text(right)])
            None -> react.none()
          },
        ],
      ),
      ..children
    ],
  )
}
