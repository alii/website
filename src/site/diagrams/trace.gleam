//// A straight line of events for one concrete run: calls and states, top to
//// bottom, with the reason for each transition written on the arrow between them.

import attribute as a
import gleam/float
import gleam/int
import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/result
import gleam/string
import html
import react.{type Element}
import site/diagram
import svg

pub type Tone {
  Ok
  Wait
}

pub type Event {
  Event(
    text: String,
    /// colour for a state; calls are left plain
    tone: Option(Tone),
    /// why the next event happens, on the arrow below this one
    note: Option(String),
  )
}

const x = 24.0

/// baseline to baseline
const step = 50.0

const arrow_x = 34.0

pub fn diagram(id: String, events: List(Event)) -> Element {
  let widest_text =
    events
    |> list.map(fn(e) { diagram.text_width(e.text) })
    |> list.reduce(float.max)
    |> result.unwrap(0.0)
  let widest_note =
    list.fold(events, 0.0, fn(acc, e) {
      float.max(acc, diagram.text_width(option.unwrap(e.note, "")) *. 0.92)
    })
  let width =
    float.max(x +. widest_text +. 6.0, arrow_x +. 12.0 +. widest_note +. 6.0)
  let count = list.length(events)
  let height = 14.0 +. int.to_float(count - 1) *. step +. 12.0
  let class = fn(e: Event) {
    case e.tone {
      Some(Ok) -> diagram.ok.text
      Some(Wait) -> diagram.wait.text
      None -> diagram.name
    }
  }

  diagram.figure(
    width,
    height,
    events
      |> list.map(fn(e) {
        e.text
        <> case e.note {
          Some(note) -> " (" <> note <> ")"
          None -> ""
        }
      })
      |> string.join("; "),
    [
      svg.defs([], [diagram.arrowhead(id <> "-spine", diagram.muted)]),
      ..list.index_map(events, fn(e, i) {
        let y = 18.0 +. int.to_float(i) *. step
        let last = i == count - 1
        svg.g([], [
          svg.text(
            [
              a.number("x", x),
              a.number("y", y),
              a.number("fontSize", diagram.font),
              a.class(class(e)),
            ],
            [html.text(e.text)],
          ),
          case last {
            True -> react.none()
            False ->
              react.fragment([
                svg.line(
                  [
                    a.number("x1", arrow_x),
                    a.number("y1", y +. 8.0),
                    a.number("x2", arrow_x),
                    a.number("y2", y +. step -. 14.0),
                    a.attr("strokeWidth", "1.5"),
                    a.class(diagram.spine),
                    a.attr("markerEnd", "url(#" <> id <> "-spine)"),
                  ],
                  [],
                ),
                case e.note {
                  Some(note) ->
                    svg.text(
                      [
                        a.number("x", arrow_x +. 12.0),
                        a.number("y", y +. step /. 2.0 +. 1.0),
                        a.number("fontSize", diagram.small),
                        a.class(diagram.label),
                      ],
                      [html.text(note)],
                    )
                  None -> react.none()
                },
              ])
          },
        ])
      })
    ],
  )
}
