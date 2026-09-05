//// Shared bits for the in-post SVG diagrams: pure SVG with Tailwind classes,
//// rendered at build time, themed with `dark:` variants.

import attribute as a
import gleam/float
import gleam/int
import gleam/string
import html
import react.{type Element}
import svg

pub const font = 12.5

pub const small = 11.5

/// approx advance of one Iosevka char at `font` px
pub const ch = 7.6

pub const pad_x = 6.0

pub fn text_width(s: String) -> Float {
  int.to_float(string.length(s)) *. ch
}

pub type Tone {
  Tone(stroke: String, fill: String, text: String, color: String, wash: String)
}

pub const ok = Tone(
  stroke: "stroke-[#6d7030] dark:stroke-[#b3bd6d]",
  fill: "fill-[#6d7030] dark:fill-[#b3bd6d]",
  text: "font-mono fill-[#6d7030] dark:fill-[#b3bd6d]",
  color: "text-[#6d7030] dark:text-[#b3bd6d]",
  wash: "fill-[#6d7030]/12 dark:fill-[#b3bd6d]/12",
)

pub const err = Tone(
  stroke: "stroke-orange-800 dark:stroke-orange-300",
  fill: "fill-orange-800 dark:fill-orange-300",
  text: "font-mono fill-orange-800 dark:fill-orange-300",
  color: "text-orange-800 dark:text-orange-300",
  wash: "fill-orange-800/12 dark:fill-orange-300/12",
)

pub const wait = Tone(
  stroke: "stroke-amber-700 dark:stroke-amber-300",
  fill: "fill-amber-700 dark:fill-amber-300",
  text: "font-mono fill-amber-700 dark:fill-amber-300",
  color: "text-amber-700 dark:text-amber-300",
  wash: "fill-amber-700/12 dark:fill-amber-300/12",
)

pub const muted = Tone(
  stroke: "stroke-stone-400 dark:stroke-stone-600",
  fill: "fill-stone-400 dark:fill-stone-500",
  text: "font-mono fill-stone-500 dark:fill-stone-500",
  color: "text-stone-400 dark:text-stone-600",
  wash: "fill-stone-400/12 dark:fill-stone-600/12",
)

pub const text = "font-mono fill-stone-600 dark:fill-stone-400"

pub const name = "font-mono fill-stone-700 dark:fill-stone-300"

pub const box = "fill-[#fdfcf9] stroke-stone-300 dark:fill-[#1c1917] dark:stroke-stone-700"

pub const spine = "stroke-stone-400 dark:stroke-stone-500"

/// secondary labels on arrows: readable, but clearly not the main text
pub const label = "font-mono fill-stone-500 dark:fill-stone-400"

/// A number the way JavaScript prints it: no trailing `.0` on whole numbers.
pub fn fmt(n: Float) -> String {
  let whole = float.truncate(n)
  case int.to_float(whole) == n {
    True -> int.to_string(whole)
    False -> float.to_string(n)
  }
}

@external(javascript, "./diagram_ffi.ts", "hypot")
pub fn hypot(a: Float, b: Float) -> Float

pub fn arrowhead(id: String, tone: Tone) -> Element {
  // the tip overshoots the line end by 1px so the line's flat end is hidden under it
  svg.marker(
    [
      a.attr("id", id),
      a.attr("markerWidth", "8"),
      a.attr("markerHeight", "7"),
      a.attr("refX", "7"),
      a.attr("refY", "3.5"),
      a.attr("orient", "auto"),
      a.attr("markerUnits", "userSpaceOnUse"),
    ],
    [svg.path([a.attr("d", "M0,0.5 L8,3.5 L0,6.5 z"), a.class(tone.fill)], [])],
  )
}

pub fn figure(
  width: Float,
  height: Float,
  label: String,
  children: List(Element),
) -> Element {
  html.figure([a.class("not-prose my-6 overflow-x-auto")], [
    svg.svg(
      [
        a.attr("viewBox", "0 0 " <> fmt(width) <> " " <> fmt(height)),
        a.class("mx-auto h-auto w-full"),
        a.style([#("maxWidth", fmt(width) <> "px")]),
        a.attr("role", "img"),
        a.attr("aria-label", label),
      ],
      children,
    ),
  ])
}

/// A rounded box with its name sitting just above it
pub fn named_box(
  x: Float,
  y: Float,
  w: Float,
  h: Float,
  name box_name: String,
  dashed dashed: Bool,
) -> Element {
  svg.g([], [
    svg.rect(
      [
        a.number("x", x),
        a.number("y", y),
        a.number("width", w),
        a.number("height", h),
        a.attr("rx", "6"),
        a.attr("strokeWidth", "1"),
        ..case dashed {
          True -> [a.attr("strokeDasharray", "3 4"), a.class(box)]
          False -> [a.class(box)]
        }
      ],
      [],
    ),
    svg.text(
      [
        a.number("x", x +. w /. 2.0),
        a.number("y", y -. 11.0),
        a.attr("textAnchor", "middle"),
        a.number("fontSize", font),
        a.class(case dashed {
          True -> muted.text
          False -> name
        }),
      ],
      [html.text(box_name)],
    ),
  ])
}

/// S-curve from one track height to another, inside a box
pub fn switch_path(x1: Float, y1: Float, x2: Float, y2: Float) -> String {
  let d = { x2 -. x1 } /. 2.0
  "M "
  <> fmt(x1)
  <> ","
  <> fmt(y1)
  <> " C "
  <> fmt(x1 +. d)
  <> ","
  <> fmt(y1)
  <> " "
  <> fmt(x2 -. d)
  <> ","
  <> fmt(y2)
  <> " "
  <> fmt(x2)
  <> ","
  <> fmt(y2)
}

/// `switch_path` without its leading `M x,y `, to continue an existing path.
pub fn switch_curve(x1: Float, y1: Float, x2: Float, y2: Float) -> String {
  let path = switch_path(x1, y1, x2, y2)
  string.drop_start(
    path,
    string.length("M " <> fmt(x1) <> "," <> fmt(y1) <> " "),
  )
}
