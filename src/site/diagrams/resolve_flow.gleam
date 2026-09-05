//// resolve(value) does exactly one thing, read value.then, and a property read
//// has three possible results: missing or not a function, a function, or the
//// getter threw.

import attribute as a
import gleam/list
import html
import react.{type Element}
import site/diagram.{type Tone}
import svg

const width = 560.0

const height = 236.0

const title_y = 18.0

const arrow_top = 26.0

const box_y = 50.0

const box_h = 44.0

/// arrowheads land here
const out_y = 172.0

const text_y = 192.0

const resolve_x = 280.0

const box_w = 184.0

type Outcome {
  Outcome(x: Float, label: String, text: String, sub: String, tone: Tone)
}

fn outcomes() -> List(Outcome) {
  [
    Outcome(
      x: resolve_x -. 150.0,
      label: "missing, or not a function",
      text: "fulfil",
      sub: "with value",
      tone: diagram.ok,
    ),
    Outcome(
      x: resolve_x,
      label: "getter throws",
      text: "reject",
      sub: "with the error",
      tone: diagram.err,
    ),
    Outcome(
      x: resolve_x +. 150.0,
      label: "a function",
      text: "follow value",
      sub: "value.then(resolve, reject)",
      tone: diagram.wait,
    ),
  ]
}

pub fn diagram(id: String) -> Element {
  let marker = fn(tone: Tone) {
    case tone == diagram.ok, tone == diagram.err {
      True, _ -> "url(#" <> id <> "-ok)"
      _, True -> "url(#" <> id <> "-err)"
      _, _ -> "url(#" <> id <> "-wait)"
    }
  }

  diagram.figure(
    width,
    height,
    "resolve(value) reads value.then: missing or not a function means fulfil with value, the getter throwing means reject with the error, a function means follow value",
    [
      svg.defs([], [
        diagram.arrowhead(id <> "-ok", diagram.ok),
        diagram.arrowhead(id <> "-err", diagram.err),
        diagram.arrowhead(id <> "-wait", diagram.wait),
        diagram.arrowhead(id <> "-spine", diagram.muted),
      ]),
      // resolve(value): one question, three answers
      svg.text(
        [
          a.number("x", resolve_x),
          a.number("y", title_y),
          a.attr("textAnchor", "middle"),
          a.number("fontSize", diagram.font),
          a.class(diagram.name),
        ],
        [html.text("resolve(value)")],
      ),
      svg.line(
        [
          a.number("x1", resolve_x),
          a.number("y1", arrow_top),
          a.number("x2", resolve_x),
          a.number("y2", box_y),
          a.attr("strokeWidth", "1.5"),
          a.class(diagram.spine),
          a.attr("markerEnd", "url(#" <> id <> "-spine)"),
        ],
        [],
      ),
      svg.rect(
        [
          a.number("x", resolve_x -. box_w /. 2.0),
          a.number("y", box_y),
          a.number("width", box_w),
          a.number("height", box_h),
          a.attr("rx", "6"),
          a.attr("strokeWidth", "1"),
          a.class(diagram.box),
        ],
        [],
      ),
      svg.text(
        [
          a.number("x", resolve_x),
          a.number("y", box_y +. box_h /. 2.0 +. 4.0),
          a.attr("textAnchor", "middle"),
          a.number("fontSize", diagram.font),
          a.class(diagram.name),
        ],
        [html.text("read value.then")],
      ),
      ..list.map(outcomes(), fn(o) {
        let x0 = resolve_x
        let y0 = box_y +. box_h
        let mid_x = { x0 +. o.x } /. 2.0
        let mid_y = { y0 +. out_y } /. 2.0
        let side = case o.x <. x0, o.x >. x0 {
          True, _ -> -1.0
          _, True -> 1.0
          _, _ -> 0.0
        }
        svg.g([], [
          svg.line(
            [
              a.number("x1", x0),
              a.number("y1", y0),
              a.number("x2", o.x),
              a.number("y2", out_y),
              a.attr("strokeWidth", "1.5"),
              a.class(o.tone.stroke),
              a.attr("markerEnd", marker(o.tone)),
            ],
            [],
          ),
          svg.text(
            [
              a.number("x", case side == 0.0 {
                True -> x0 +. 8.0
                False -> mid_x +. side *. 14.0
              }),
              a.number("y", case side == 0.0 {
                True -> out_y -. 12.0
                False -> mid_y -. 4.0
              }),
              a.attr("textAnchor", case side <. 0.0 {
                True -> "end"
                False -> "start"
              }),
              a.number("fontSize", diagram.small),
              a.class(diagram.label),
            ],
            [html.text(o.label)],
          ),
          svg.text(
            [
              a.number("x", o.x),
              a.number("y", text_y),
              a.attr("textAnchor", "middle"),
              a.number("fontSize", diagram.font),
              a.class(o.tone.text),
            ],
            [html.text(o.text)],
          ),
          svg.text(
            [
              a.number("x", o.x),
              a.number("y", text_y +. 16.0),
              a.attr("textAnchor", "middle"),
              a.number("fontSize", diagram.small),
              a.class(diagram.label),
            ],
            [html.text(o.sub)],
          ),
        ])
      })
    ],
  )
}
