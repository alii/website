//// `pages/demos/serverless-discord-oauth`.

import attribute as a
import gleam/int
import gleam/javascript/promise.{type Promise}
import gleam/option.{None, Some}
import gleam/result
import html
import js.{type Nullable}
import next/link
import next/page.{type ServerSideProps, type ServerSidePropsContext}
import react.{type Element}
import site/discord_demo.{type User}
import site/discord_demo_session

pub type Props {
  Props(user: Nullable(User))
}

pub fn page(props: Props) -> Element {
  case js.to_option(props.user) {
    None ->
      html.div([a.class("mx-auto max-w-md py-20")], [
        html.h1([], [html.text("you are not signed in!")]),
        link.link(
          [a.class("text-blue-500 dark:text-blue-300"), a.href("/api/oauth")],
          [html.text("Log in with Discord ↗")],
        ),
      ])
    Some(user) -> {
      let username = discord_demo.username(user)
      html.div([a.class("mx-auto max-w-md py-20")], [
        html.img([
          a.src(avatar_url(user)),
          a.alt("Avatar URL for " <> username <> "."),
        ]),
        html.h1([], [html.text("hello, "), html.text(username), html.text("!")]),
        html.p([], [html.text("clear your cookies to logout!")]),
      ])
    }
  }
}

fn avatar_url(user: User) -> String {
  let id = discord_demo.id(user)
  case discord_demo.avatar(user) {
    Some(hash) -> "https://cdn.discordapp.com/avatars/" <> id <> "/" <> hash
    None -> {
      let discriminator = discord_demo.discriminator(user)
      let index = case discriminator {
        "0" -> discord_demo.default_avatar_index(id)
        _ -> result.unwrap(int.parse(discriminator), 0) % 5
      }
      "https://cdn.discordapp.com/embed/avatars/"
      <> int.to_string(index)
      <> ".png"
    }
  }
}

pub fn get_server_side_props(
  context: ServerSidePropsContext,
) -> Promise(ServerSideProps(Props)) {
  let user =
    page.cookie(context, "token")
    |> option.then(fn(token) {
      case token {
        "" -> None
        _ -> Some(token)
      }
    })
    |> option.map(discord_demo_session.verify)
    |> js.from_option
  promise.resolve(page.server_side_props(Props(user:)))
}
