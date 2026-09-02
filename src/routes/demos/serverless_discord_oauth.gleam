import attribute as a
import codec.{type Codec}
import gleam/int
import gleam/javascript/promise.{type Promise}
import gleam/option.{type Option, None, Some}
import gleam/result
import html
import next/link
import page/server.{type Request, type Response, Render}
import react.{type Element}
import site/discord_demo.{type User}

pub type Props {
  Props(user: Option(User))
}

pub fn props() -> Codec(Props) {
  codec.object1(
    Props,
    codec.field("user", codec.option(discord_demo.codec()), fn(p: Props) {
      p.user
    }),
  )
}

pub fn view(props: Props) -> Element {
  case props.user {
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

pub fn respond(request: Request) -> Promise(Response(Props)) {
  let user =
    server.cookie(request, "token")
    |> option.then(fn(token) {
      case token {
        "" -> None
        _ -> Some(token)
      }
    })
    |> option.map(verify)
  promise.resolve(Render(Props(user:)))
}

// throws on a bad token, like the original
@external(javascript, "./serverless_discord_oauth_ffi.ts", "verify")
fn verify(token: String) -> User
