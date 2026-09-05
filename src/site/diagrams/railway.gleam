//// A two-track railway in the style of Scott Wlaschin's Railway Oriented
//// Programming. Each step is a box the success track runs through, with a
//// switch that can divert onto the failure track below.

import attribute as a
import gleam/float
import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/string
import html
import react.{type Element}
import site/diagram.{type Tone, fmt}
import svg

const top = 44.0

const bot = 92.0

const box_top = 26.0

const box_bottom = 110.0

const height = 122.0

const gap = 30.0

const switch_inset = 14.0

const train_speed = 70.0

pub type Train {
  /// rides the top track all the way
  Success
  /// the index of the step whose switch sends it onto the failure track
  DerailAt(Int)
}

pub type Props {
  Props(
    /// Label at the left of the success track
    input: String,
    /// One box per step, in order
    steps: List(String),
    /// Label at the right end of the success track
    success: String,
    /// Label at the right end of the failure track
    failure: String,
    /// Draw the failure track dashed and its label muted: a track with no type on it
    untyped_failure: Bool,
    train: Option(Train),
  )
}

type Box {
  Box(name: String, x: Float, w: Float)
}

type Layout {
  Layout(
    input_x: Float,
    track_start: Float,
    boxes: List(Box),
    track_end: Float,
    label_x: Float,
    width: Float,
  )
}

fn layout(props: Props) -> Layout {
  let x = diagram.pad_x
  let input_x = x
  let x = x +. diagram.text_width(props.input) +. 8.0
  let track_start = x
  let x = x +. gap

  let #(x, boxes) =
    list.fold(props.steps, #(x, []), fn(acc, name) {
      let #(x, boxes) = acc
      let w = float.max(88.0, diagram.text_width(name) +. 28.0)
      #(x +. w +. gap, [Box(name:, x:, w:), ..boxes])
    })
  let boxes = list.reverse(boxes)

  let track_end = x
  let label_x = track_end +. 8.0
  let width =
    label_x
    +. float.max(
      diagram.text_width(props.success),
      diagram.text_width(props.failure),
    )
    +. diagram.pad_x

  Layout(input_x:, track_start:, boxes:, track_end:, label_x:, width:)
}

type Ride {
  /// `switch_at` is the fraction of the route where the train changes track (1 = never)
  Ride(route: String, switch_at: Float, duration: Float)
}

fn train_route(
  track_start: Float,
  track_end: Float,
  derail: Option(Box),
) -> Ride {
  case derail {
    None ->
      Ride(
        route: "M "
          <> fmt(track_start)
          <> ","
          <> fmt(top)
          <> " H "
          <> fmt(track_end),
        switch_at: 1.0,
        duration: { track_end -. track_start } /. train_speed,
      )
    Some(box) -> {
      let x1 = box.x +. switch_inset
      let x2 = box.x +. box.w -. switch_inset
      let before = x1 -. track_start
      let curve = diagram.hypot(x2 -. x1, bot -. top)
      let after = track_end -. x2
      let total = before +. curve +. after
      Ride(
        route: "M "
          <> fmt(track_start)
          <> ","
          <> fmt(top)
          <> " H "
          <> fmt(x1)
          <> " "
          <> diagram.switch_curve(x1, top, x2, bot)
          <> " H "
          <> fmt(track_end),
        switch_at: { before +. curve /. 2.0 } /. total,
        duration: total /. train_speed,
      )
    }
  }
}

pub fn railway(id: String, props: Props) -> Element {
  let ok_marker = "url(#" <> id <> "-ok)"
  let err_marker = "url(#" <> id <> "-err)"
  let Layout(input_x, track_start, boxes, track_end, label_x, width) =
    layout(props)
  let derail = case props.train {
    Some(DerailAt(index)) ->
      list.drop(boxes, index) |> list.first |> option.from_result
    _ -> None
  }
  let ride = case props.train {
    None -> None
    Some(_) -> Some(train_route(track_start, track_end, derail))
  }
  let fail = case props.untyped_failure {
    True -> diagram.muted
    False -> diagram.err
  }
  let fail_dash = case props.untyped_failure {
    True -> [a.attr("strokeDasharray", "3 4")]
    False -> []
  }
  let last = list.length(boxes) - 1

  diagram.figure(
    width,
    height,
    "Railway diagram: "
      <> props.input
      <> " through "
      <> string.join(props.steps, ", ")
      <> " to "
      <> props.success
      <> " or "
      <> props.failure,
    [
      svg.defs([], [
        diagram.arrowhead(id <> "-ok", diagram.ok),
        diagram.arrowhead(id <> "-err", fail),
        case ride {
          Some(ride) ->
            svg.path(
              [
                a.attr("id", id <> "-route"),
                a.attr("d", ride.route),
                a.attr("fill", "none"),
              ],
              [],
            )
          None -> react.none()
        },
      ]),
      ..list.map(boxes, fn(box) {
        diagram.named_box(
          box.x,
          box_top,
          box.w,
          box_bottom -. box_top,
          name: box.name,
          dashed: False,
        )
      })
    ]
      |> list.append([
        svg.text(
          [
            a.number("x", input_x),
            a.number("y", top +. 4.0),
            a.number("fontSize", diagram.font),
            a.class(diagram.text),
          ],
          [html.text(props.input)],
        ),
        // success track: one continuous line, arrowheads drawn as short overlays
        svg.line(
          [
            a.number("x1", track_start),
            a.number("y1", top),
            a.number("x2", track_end),
            a.number("y2", top),
            a.attr("strokeWidth", "1.5"),
            a.class(diagram.ok.stroke),
            a.attr("markerEnd", ok_marker),
          ],
          [],
        ),
      ])
      |> list.append(
        list.map(boxes, fn(box) {
          svg.line(
            [
              a.number("x1", box.x -. gap),
              a.number("y1", top),
              a.number("x2", box.x),
              a.number("y2", top),
              a.attr("strokeWidth", "1.5"),
              a.class(diagram.ok.stroke),
              a.attr("markerEnd", ok_marker),
            ],
            [],
          )
        }),
      )
      |> list.append(
        // failure track: starts at the first switch, passes through later boxes
        list.index_map(boxes, fn(box, i) {
          let x1 = box.x +. switch_inset
          let x2 = box.x +. box.w -. switch_inset
          let next_x = case list.drop(boxes, i + 1) {
            [next, ..] -> next.x
            [] -> track_end
          }
          svg.g([], [
            svg.path(
              [
                a.attr("d", diagram.switch_path(x1, top, x2, bot)),
                a.attr("fill", "none"),
                a.attr("strokeWidth", "1.5"),
                ..list.append(fail_dash, [a.class(fail.stroke)])
              ],
              [],
            ),
            case i > 0 {
              True ->
                svg.line(
                  [
                    a.number("x1", box.x),
                    a.number("y1", bot),
                    a.number("x2", box.x +. box.w),
                    a.number("y2", bot),
                    a.attr("strokeWidth", "1.5"),
                    ..list.append(fail_dash, [a.class(fail.stroke)])
                  ],
                  [],
                )
              False -> react.none()
            },
            svg.line(
              [
                a.number("x1", x2),
                a.number("y1", bot),
                a.number("x2", case i == last {
                  True -> track_end
                  False -> next_x
                }),
                a.number("y2", bot),
                a.attr("strokeWidth", "1.5"),
                ..list.append(fail_dash, [
                  a.class(fail.stroke),
                  a.attr("markerEnd", err_marker),
                ])
              ],
              [],
            ),
          ])
        }),
      )
      |> list.append([
        svg.text(
          [
            a.number("x", label_x),
            a.number("y", top +. 4.0),
            a.number("fontSize", diagram.font),
            a.class(diagram.text),
          ],
          [html.text(props.success)],
        ),
        svg.text(
          [
            a.number("x", label_x),
            a.number("y", bot +. 4.0),
            a.number("fontSize", diagram.font),
            a.class(case props.untyped_failure {
              True ->
                diagram.text <> " fill-stone-500 italic dark:fill-stone-500"
              False -> diagram.text
            }),
          ],
          [html.text(props.failure)],
        ),
        // the train: two dots on the same route, fading between them at the switch
        case ride {
          Some(ride) -> train(id, ride, derail, fail)
          None -> react.none()
        },
      ]),
  )
}

fn train(id: String, ride: Ride, derail: Option(Box), fail: Tone) -> Element {
  let dur = fmt(ride.duration) <> "s"
  let key_times =
    "0;"
    <> fmt(ride.switch_at -. 0.02)
    <> ";"
    <> fmt(ride.switch_at +. 0.02)
    <> ";1"
  let motion =
    svg.animate_motion(
      [a.attr("dur", dur), a.attr("repeatCount", "indefinite")],
      [svg.mpath([a.attr("href", "#" <> id <> "-route")], [])],
    )
  let fade = fn(values) {
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
  svg.g([a.class("motion-reduce:hidden")], [
    svg.circle([a.attr("r", "4"), a.class(diagram.ok.fill)], [
      motion,
      case derail {
        Some(_) -> fade("1;1;0;0")
        None -> react.none()
      },
    ]),
    case derail {
      Some(_) ->
        svg.circle([a.attr("r", "4"), a.class(fail.fill)], [
          motion,
          fade("0;0;1;1"),
        ])
      None -> react.none()
    },
  ])
}
