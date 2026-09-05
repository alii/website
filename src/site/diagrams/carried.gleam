//// Promise(Result(a, e)): a one-track promise carrying a two-track value. The
//// Result rides the fulfil track; the reject track is still there, still
//// untyped, and reserved for disasters.

import attribute as a
import html
import react.{type Element}
import site/diagram.{fmt}
import svg

const top = 40.0

const bot = 92.0

const height = 118.0

const cap_h = 30.0

const track_len = 420.0

const ok_label = "Ok(b)"

const err_label = "Error(e)"

pub fn diagram(id: String) -> Element {
  let track_start = diagram.pad_x +. diagram.text_width("fulfilled") +. 10.0
  let track_end = track_start +. track_len
  let half_ok = diagram.text_width(ok_label) +. 24.0
  let half_err = diagram.text_width(err_label) +. 24.0
  let cap_w = half_ok +. half_err
  let cap_x = track_start +. { track_len -. cap_w } /. 2.0
  let label_x = track_end +. 8.0
  let width = label_x +. diagram.text_width("Result(b, e)") +. diagram.pad_x
  let r = cap_h /. 2.0

  diagram.figure(
    width,
    height,
    "A promise whose fulfil track carries a Result with Ok and Error; its reject track is untyped and unused",
    [
      svg.defs([], [
        diagram.arrowhead(id <> "-ok", diagram.ok),
        diagram.arrowhead(id <> "-muted", diagram.muted),
      ]),
      // fulfil track, broken around the cargo
      svg.text(
        [
          a.number("x", diagram.pad_x),
          a.number("y", top +. 4.0),
          a.number("fontSize", diagram.font),
          a.class(diagram.text),
        ],
        [html.text("fulfilled")],
      ),
      svg.line(
        [
          a.number("x1", track_start),
          a.number("y1", top),
          a.number("x2", cap_x),
          a.number("y2", top),
          a.attr("strokeWidth", "1.5"),
          a.class(diagram.ok.stroke),
        ],
        [],
      ),
      svg.line(
        [
          a.number("x1", cap_x +. cap_w),
          a.number("y1", top),
          a.number("x2", track_end),
          a.number("y2", top),
          a.attr("strokeWidth", "1.5"),
          a.class(diagram.ok.stroke),
          a.attr("markerEnd", "url(#" <> id <> "-ok)"),
        ],
        [],
      ),
      svg.text(
        [
          a.number("x", label_x),
          a.number("y", top +. 4.0),
          a.number("fontSize", diagram.font),
          a.class(diagram.text),
        ],
        [html.text("Result(b, e)")],
      ),
      // the cargo: one capsule, two halves
      svg.path(
        [
          a.attr(
            "d",
            "M "
              <> fmt(cap_x +. r)
              <> ","
              <> fmt(top -. r)
              <> " H "
              <> fmt(cap_x +. half_ok)
              <> " V "
              <> fmt(top +. r)
              <> " H "
              <> fmt(cap_x +. r)
              <> " A "
              <> fmt(r)
              <> " "
              <> fmt(r)
              <> " 0 0 1 "
              <> fmt(cap_x +. r)
              <> ","
              <> fmt(top -. r)
              <> " Z",
          ),
          a.attr("strokeWidth", "1.2"),
          a.class(diagram.ok.stroke <> " " <> diagram.ok.wash),
        ],
        [],
      ),
      svg.path(
        [
          a.attr(
            "d",
            "M "
              <> fmt(cap_x +. half_ok)
              <> ","
              <> fmt(top -. r)
              <> " H "
              <> fmt(cap_x +. cap_w -. r)
              <> " A "
              <> fmt(r)
              <> " "
              <> fmt(r)
              <> " 0 0 1 "
              <> fmt(cap_x +. cap_w -. r)
              <> ","
              <> fmt(top +. r)
              <> " H "
              <> fmt(cap_x +. half_ok)
              <> " Z",
          ),
          a.attr("strokeWidth", "1.2"),
          a.class(diagram.err.stroke <> " " <> diagram.err.wash),
        ],
        [],
      ),
      svg.text(
        [
          a.number("x", cap_x +. half_ok /. 2.0),
          a.number("y", top +. 4.0),
          a.attr("textAnchor", "middle"),
          a.number("fontSize", diagram.font),
          a.class(diagram.ok.text),
        ],
        [html.text(ok_label)],
      ),
      svg.text(
        [
          a.number("x", cap_x +. half_ok +. half_err /. 2.0),
          a.number("y", top +. 4.0),
          a.attr("textAnchor", "middle"),
          a.number("fontSize", diagram.font),
          a.class(diagram.err.text),
        ],
        [html.text(err_label)],
      ),
      // reject track, untyped and idle
      svg.text(
        [
          a.number("x", diagram.pad_x),
          a.number("y", bot +. 4.0),
          a.number("fontSize", diagram.font),
          a.class(diagram.text),
        ],
        [html.text("rejected")],
      ),
      svg.line(
        [
          a.number("x1", track_start),
          a.number("y1", bot),
          a.number("x2", track_end),
          a.number("y2", bot),
          a.attr("strokeWidth", "1.5"),
          a.attr("strokeDasharray", "3 4"),
          a.class(diagram.muted.stroke),
          a.attr("markerEnd", "url(#" <> id <> "-muted)"),
        ],
        [],
      ),
      svg.text(
        [
          a.number("x", label_x),
          a.number("y", bot +. 4.0),
          a.number("fontSize", diagram.font),
          a.class("fill-stone-500 font-mono italic dark:fill-stone-500"),
        ],
        [html.text("any")],
      ),
      svg.text(
        [
          a.number("x", track_start +. track_len /. 2.0),
          a.number("y", bot +. 18.0),
          a.attr("textAnchor", "middle"),
          a.number("fontSize", diagram.small),
          a.class(diagram.muted.text),
        ],
        [html.text("only ever disasters we don't know about")],
      ),
    ],
  )
}
