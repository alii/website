import attribute as a
import codec.{type Codec}
import gleam/javascript/promise.{type Promise}
import gleam/option.{type Option, None, Some}
import gleam/string
import html
import next/link
import page.{type Loaded, Found}
import react.{type Element}
import site/constants
import site/env
import site/lanyard.{type Presence, type Spotify}
import site/layout
import site/posts
import site/ui

pub type Props {
  Props(
    lanyard: Option(Presence),
    backup_lanyard: Option(Presence),
    location: String,
  )
}

pub fn props() -> Codec(Props) {
  codec.object3(
    Props,
    codec.field("lanyard", codec.option(lanyard.codec()), fn(p: Props) {
      p.lanyard
    }),
    codec.field("backup_lanyard", codec.option(lanyard.codec()), fn(p: Props) {
      p.backup_lanyard
    }),
    codec.field("location", codec.string(), fn(p: Props) { p.location }),
  )
}

pub fn load() -> Promise(Loaded(Props)) {
  use presence <- promise.await(lanyard.get(constants.discord_id))
  use backup_presence <- promise.await(lanyard.get(constants.backup_discord_id))

  let location =
    presence
    |> option.then(lanyard.location)
    |> option.unwrap(env.default_location())

  promise.resolve(Found(
    Props(lanyard: presence, backup_lanyard: backup_presence, location:),
    revalidate: Some(10),
  ))
}

pub fn view(props: Props) -> Element {
  let id = constants.discord_id
  let backup_id = constants.backup_discord_id

  let presences =
    lanyard.use_lanyard([id, backup_id], [
      #(id, props.lanyard),
      #(backup_id, props.backup_lanyard),
    ])
  let presence = lanyard.presence(presences, id)
  let backup_presence = lanyard.presence(presences, backup_id)

  let spotify =
    option.or(
      option.then(presence, lanyard.spotify),
      option.then(backup_presence, lanyard.spotify),
    )
  let location =
    presence
    |> option.then(lanyard.location)
    |> option.unwrap(props.location)

  let visible = posts.all() |> posts.sort |> posts.visible

  layout.layout([
    html.h1(
      [a.class("mb-6 text-[15px] font-bold text-stone-950 dark:text-stone-50")],
      [
        html.text("Alistair Smith"),
      ],
    ),
    html.div([a.class("space-y-4")], [
      html.p([], [
        html.text("I work at"),
        html.text(" "),
        external_link("https://www.anthropic.com/", "Anthropic"),
        html.text(" "),
        html.text("on"),
        html.text(" "),
        external_link("https://bun.com", "Bun"),
        html.text(" "),
        html.text("and"),
        html.text(" "),
        external_link(
          "https://www.claude.com/product/claude-code",
          "Claude Code",
        ),
        html.text("."),
      ]),
      html.p([], [
        html.text(
          "I'm interested in language specifications and type systems. I've been called a TypeScript wizard at least a few times. It's nice to meet you.",
        ),
      ]),
      html.p([a.class(ui.muted)], [
        html.text("Currently in"),
        html.text(" "),
        external_link("https://maps.apple.com/?q=" <> location, location),
        html.text("."),
        case spotify {
          Some(spotify) -> listening_to(spotify)
          None -> react.none()
        },
      ]),
    ]),
    html.section([a.class("mt-16")], [
      html.h2([a.class(ui.box_hd)], [html.text("writing")]),
      posts.listing(visible),
    ]),
  ])
}

fn listening_to(spotify: Spotify) -> Element {
  react.fragment([
    html.text(" "),
    html.text("Listening to"),
    html.text(" "),
    external_link(
      "https://open.spotify.com/track/" <> lanyard.track_id(spotify),
      lanyard.song(spotify),
    ),
    case lanyard.artist(spotify) {
      Some(artist) ->
        react.fragment([
          html.text(" by "),
          html.text(string.replace(artist, "; ", ", ")),
        ])
      None -> react.none()
    },
    html.text("."),
  ])
}

fn external_link(href: String, label: String) -> Element {
  link.link([a.href(href), a.target("_blank")], [html.text(label)])
}
