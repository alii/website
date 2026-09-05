//// NewPromiseResolveThenableJob, twice: the order the spec gives, and the order
//// JavaScriptCore's fast path used before the fix. Same two boxes, swapped. In
//// the spec lane the throw lands on the failure track. In the JSC lane the
//// failure track hasn't been built yet, so the throw lands nowhere.

import attribute as a
import gleam/float
import gleam/int
import gleam/list
import gleam/result
import html
import react.{type Element}
import site/diagram.{fmt}
import svg

const lane_h = 132.0

const top = 44.0

const bot = 92.0

const box_top = 26.0

const box_h = 84.0

const gap = 30.0

const switch_inset = 14.0

const train_speed = 70.0

type Lane {
  Lane(label: String, steps: #(String, String), throws_at: Int)
}

const lanes = [
  Lane(
    label: "spec",
    steps: #("create resolve/reject", "call x.then"),
    throws_at: 1,
  ),
  Lane(
    label: "JSC, before",
    steps: #("look up species", "create resolve/reject"),
    throws_at: 0,
  ),
]

type Layout {
  Layout(
    track_start: Float,
    col_w: #(Float, Float),
    box_x: #(Float, Float),
    track_end: Float,
    label_x: Float,
    width: Float,
  )
}

fn widest(measure: fn(Lane) -> Float) -> Float {
  lanes
  |> list.map(measure)
  |> list.reduce(float.max)
  |> result.unwrap(0.0)
}

fn layout() -> Layout {
  let label_w = widest(fn(l) { diagram.text_width(l.label) }) +. 10.0
  let track_start = diagram.pad_x +. label_w
  let col_w = #(
    widest(fn(l) { diagram.text_width(l.steps.0) +. 28.0 }),
    widest(fn(l) { diagram.text_width(l.steps.1) +. 28.0 }),
  )
  let box_x = #(track_start +. gap, track_start +. gap +. col_w.0 +. gap)
  let track_end = box_x.1 +. col_w.1 +. gap
  let label_x = track_end +. 8.0
  let width = label_x +. diagram.text_width("rejected") +. diagram.pad_x
  Layout(track_start:, col_w:, box_x:, track_end:, label_x:, width:)
}

fn column(l: Layout, at: Int) -> #(Float, Float) {
  case at {
    0 -> #(l.box_x.0, l.col_w.0)
    _ -> #(l.box_x.1, l.col_w.1)
  }
}

type Route {
  Route(d: String, enter_curve: Float, leave_curve: Float, total: Float)
}

fn route(l: Layout, oy: Float, at: Int) -> Route {
  let #(bx, cw) = column(l, at)
  let x1 = bx +. switch_inset
  let x2 = bx +. cw -. switch_inset
  let before = x1 -. l.track_start
  let curve = diagram.hypot(x2 -. x1, bot -. top)
  let total = before +. curve +. { l.track_end -. x2 }
  Route(
    d: "M "
      <> fmt(l.track_start)
      <> ","
      <> fmt(oy +. top)
      <> " H "
      <> fmt(x1)
      <> " "
      <> diagram.switch_curve(x1, oy +. top, x2, oy +. bot)
      <> " H "
      <> fmt(l.track_end),
    enter_curve: before /. total,
    leave_curve: { before +. curve } /. total,
    total:,
  )
}

pub fn diagram(id: String) -> Element {
  let l = layout()
  let rides =
    list.index_map(lanes, fn(lane, i) {
      route(l, int.to_float(i) *. lane_h, lane.throws_at)
    })
  let duration =
    {
      rides
      |> list.map(fn(r) { r.total })
      |> list.reduce(float.max)
      |> result.unwrap(0.0)
    }
    /. train_speed

  diagram.figure(
    l.width,
    lane_h *. 2.0,
    "The thenable job in spec order versus JavaScriptCore's order before the fix",
    [
      svg.defs([], [
        diagram.arrowhead(id <> "-ok", diagram.ok),
        diagram.arrowhead(id <> "-err", diagram.err),
        diagram.arrowhead(id <> "-muted", diagram.muted),
        svg.linear_gradient(
          [
            a.attr("id", id <> "-fade"),
            a.attr("gradientUnits", "userSpaceOnUse"),
            a.number("x1", l.box_x.0),
            a.attr("y1", "0"),
            a.number("x2", l.box_x.0 +. l.col_w.0),
            a.attr("y2", "0"),
          ],
          [
            svg.stop(
              [
                a.attr("offset", "0"),
                a.attr("stopColor", "currentColor"),
                a.class(diagram.err.color),
              ],
              [],
            ),
            svg.stop(
              [
                a.attr("offset", "1"),
                a.attr("stopColor", "currentColor"),
                a.attr("stopOpacity", "0"),
                a.class(diagram.err.color),
              ],
              [],
            ),
          ],
        ),
        ..list.index_map(rides, fn(r, i) {
          svg.path(
            [
              a.attr("id", id <> "-route-" <> int.to_string(i)),
              a.attr("d", r.d),
              a.attr("fill", "none"),
            ],
            [],
          )
        })
      ]),
      ..list.index_map(lanes, fn(lane, i) { lane_view(id, l, lane, i) })
    ]
      |> list.append([trains(id, rides, duration)]),
  )
}

fn lane_view(id: String, l: Layout, lane: Lane, i: Int) -> Element {
  let oy = int.to_float(i) *. lane_h
  let top = oy +. top
  let bot = oy +. bot
  let is_spec = i == 0
  let #(tx, tw) = column(l, lane.throws_at)
  let sx1 = tx +. switch_inset
  let sx2 = tx +. tw -. switch_inset
  let label = fn(y: Float, class: String, text: String) {
    svg.text(
      [
        a.number("x", l.label_x),
        a.number("y", y +. 4.0),
        a.number("fontSize", diagram.font),
        a.class(class),
      ],
      [html.text(text)],
    )
  }
  let track = fn(x1: Float, x2: Float, y: Float, extra: List(react.Attribute)) {
    svg.line(
      [
        a.number("x1", x1),
        a.number("y1", y),
        a.number("x2", x2),
        a.number("y2", y),
        a.attr("strokeWidth", "1.5"),
        ..extra
      ],
      [],
    )
  }
  let ok_arrow = [
    a.class(diagram.ok.stroke),
    a.attr("markerEnd", "url(#" <> id <> "-ok)"),
  ]

  svg.g([], [
    svg.text(
      [
        a.number("x", diagram.pad_x),
        a.number("y", top +. 4.0),
        a.number("fontSize", diagram.font),
        a.class(diagram.text),
      ],
      [html.text(lane.label)],
    ),
    diagram.named_box(
      l.box_x.0,
      oy +. box_top,
      l.col_w.0,
      box_h,
      name: lane.steps.0,
      dashed: False,
    ),
    diagram.named_box(
      l.box_x.1,
      oy +. box_top,
      l.col_w.1,
      box_h,
      name: lane.steps.1,
      dashed: !is_spec,
    ),
    // success track up to the switch, then either onward (spec) or never reached (JSC)
    track(l.track_start, l.box_x.0, top, ok_arrow),
    case is_spec {
      True ->
        react.fragment([
          track(l.box_x.0, l.box_x.1, top, ok_arrow),
          track(l.box_x.1, l.track_end, top, ok_arrow),
          label(top, diagram.text, "fulfilled"),
        ])
      False ->
        react.fragment([
          track(l.box_x.0, sx1, top, [a.class(diagram.ok.stroke)]),
          track(sx1, l.track_end, top, [
            a.attr("strokeDasharray", "3 4"),
            a.class(diagram.muted.stroke),
            a.attr("markerEnd", "url(#" <> id <> "-muted)"),
          ]),
          label(top, diagram.muted.text, "fulfilled"),
        ])
    },
    // the throw
    svg.text(
      [
        a.number("x", sx2 +. 6.0),
        a.number("y", { top +. bot } /. 2.0 +. 4.0),
        a.number("fontSize", diagram.small),
        a.class(diagram.err.text),
      ],
      [
        html.text(case is_spec {
          True -> "throws"
          False -> "throws, uncaught"
        }),
      ],
    ),
    case is_spec {
      True ->
        react.fragment([
          svg.path(
            [
              a.attr("d", diagram.switch_path(sx1, top, sx2, bot)),
              a.attr("fill", "none"),
              a.attr("strokeWidth", "1.5"),
              a.class(diagram.err.stroke),
            ],
            [],
          ),
          track(sx2, l.track_end, bot, [
            a.class(diagram.err.stroke),
            a.attr("markerEnd", "url(#" <> id <> "-err)"),
          ]),
          label(bot, diagram.text, "rejected"),
        ])
      False ->
        react.fragment([
          svg.path(
            [
              a.attr("d", diagram.switch_path(sx1, top, sx2, bot)),
              a.attr("fill", "none"),
              a.attr("strokeWidth", "1.5"),
              a.attr("stroke", "url(#" <> id <> "-fade)"),
            ],
            [],
          ),
          label(bot, diagram.muted.text, "rejected"),
          svg.text(
            [
              a.number("x", l.width -. diagram.pad_x),
              a.number("y", oy +. lane_h -. 10.0),
              a.attr("textAnchor", "end"),
              a.number("fontSize", diagram.small),
              a.class("fill-orange-800 font-mono italic dark:fill-orange-300"),
            ],
            [html.text("neither. pending forever.")],
          ),
        ])
    },
  ])
}

/// trains, in step
fn trains(id: String, rides: List(Route), duration: Float) -> Element {
  let dur = fmt(duration) <> "s"
  svg.g(
    [a.class("motion-reduce:hidden")],
    list.index_map(rides, fn(r, i) {
      let is_spec = i == 0
      let mid = { r.enter_curve +. r.leave_curve } /. 2.0
      let motion =
        svg.animate_motion(
          [a.attr("dur", dur), a.attr("repeatCount", "indefinite")],
          [
            svg.mpath(
              [a.attr("href", "#" <> id <> "-route-" <> int.to_string(i))],
              [],
            ),
          ],
        )
      let fade = fn(values: String, key_times: String) {
        svg.animate(
          [
            a.attr("attributeName", "opacity"),
            a.attr("values", values),
            a.attr("keyTimes", key_times),
            a.attr("dur", dur),
            a.attr("repeatCount", "indefinite"),
          ],
          [],
        )
      }
      let around_mid =
        "0;" <> fmt(mid -. 0.02) <> ";" <> fmt(mid +. 0.02) <> ";1"
      svg.g([], [
        svg.circle([a.attr("r", "4"), a.class(diagram.ok.fill)], [
          motion,
          fade("1;1;0;0", case is_spec {
            True -> around_mid
            False ->
              "0;" <> fmt(r.enter_curve) <> ";" <> fmt(r.leave_curve) <> ";1"
          }),
        ]),
        case is_spec {
          True ->
            svg.circle([a.attr("r", "4"), a.class(diagram.err.fill)], [
              motion,
              fade("0;0;1;1", around_mid),
            ])
          False -> react.none()
        },
      ])
    }),
  )
}
