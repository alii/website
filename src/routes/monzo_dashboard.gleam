//// `pages/monzo/dashboard`: my Monzo accounts, behind the Monzo OAuth flow.

import attribute as a
import gleam/javascript/promise.{type Promise}
import gleam/list
import gleam/option.{None, Some}
import gleam/string
import html
import next/link
import next/page.{type ServerSideProps, type ServerSidePropsContext}
import react.{type Element}
import site/monzo.{type Account, type Dashboard, type Pot, type Webhook}

pub fn page(props: Dashboard) -> Element {
  case monzo.accounts(props) {
    Ok(accounts) -> dashboard(accounts)
    Error(monzo.Failure(error:, body:)) -> failure(error, body)
  }
}

fn failure(error: String, body: String) -> Element {
  html.div(
    [
      a.class(
        "mx-auto my-16 max-w-2xl space-y-8 border bg-zinc-100 p-10 dark:border-zinc-800 dark:bg-zinc-900",
      ),
    ],
    [
      html.p([], [html.text(error)]),
      html.pre(
        [
          a.class(
            "w-full overflow-x-auto border px-2 py-1.5 text-zinc-600 dark:border-zinc-800 dark:text-zinc-400",
          ),
        ],
        [html.text(body)],
      ),
      html.p([a.class("text-zinc-400")], [
        html.text(
          "You may need to explicitly enable permissions in the Monzo app, on your phone.",
        ),
      ]),
      html.div([], [
        link.link(
          [
            a.class(
              "bg-purple-100 px-2 py-1.5 text-sm text-purple-600 dark:bg-purple-600 dark:text-purple-100",
            ),
            a.href("/api/oauth/monzo/redirect"),
          ],
          [html.text("Retry authorization flow")],
        ),
      ]),
    ],
  )
}

fn dashboard(accounts: List(Account)) -> Element {
  html.div(
    [
      a.class(
        "mx-auto my-16 max-w-3xl space-y-8 border bg-zinc-100 p-10 shadow-2xl shadow-black/25 dark:border-zinc-800 dark:bg-zinc-900",
      ),
    ],
    [
      html.div([a.class("space-y-4")], [
        html.h1([a.class("text-xl font-bold")], [html.text("Accounts")]),
        ..accounts
        |> list.filter(fn(account) { !account.closed })
        |> list.map(account_card)
      ]),
      html.p([a.class("text-sm text-zinc-500")], [
        html.text(
          "Webhooks are currently misbehaving due to an issue with Monzo's API",
        ),
      ]),
    ],
  )
}

fn account_card(account: Account) -> Element {
  let format = fn(pennies) { monzo.format(account.currency, pennies) }

  html.div([a.key(account.id), a.class("border dark:border-zinc-800")], [
    html.div([a.class("flex justify-between p-2.5")], [
      html.div([a.class("space-y-0.5")], [
        html.p([], [
          html.text(string.join(account.owner_names, ", ")),
          html.text(" ("),
          html.text(account.kind),
          html.text(")"),
        ]),
        case account.balance {
          Some(balance) ->
            html.p([a.class("text-xl text-zinc-600 dark:text-zinc-300")], [
              html.text(format(balance.balance)),
              html.text(" "),
              case balance.spend_today {
                0 -> react.none()
                spend ->
                  html.span(
                    [a.class("text-sm text-zinc-500 dark:text-zinc-400")],
                    [
                      html.text("-"),
                      html.text(format(abs(spend))),
                      html.text(" today"),
                    ],
                  )
              },
            ])
          None ->
            html.p([a.class("text-sm text-zinc-500 dark:text-zinc-400")], [
              html.text(case account.kind {
                "uk_monzo_flex_backing_loan" ->
                  "This is a loan account used for flex transactions. It has no balance and will be considered closed once the debt is paid off."
                _ -> "This type of acccount has no balance"
              }),
            ])
        },
      ]),
      html.div([a.class("flex flex-col items-end space-y-1")], [
        html.p([a.class("text-xs text-zinc-500")], [
          html.text(account.description),
        ]),
        html.p([a.class("text-xs text-zinc-500")], [html.text(account.id)]),
        case account.payment_details {
          Some(details) ->
            html.p([a.class("text-xs text-zinc-500")], [
              html.text(details.account_number),
              html.text(" •"),
              html.text(" "),
              html.text(details.sort_code),
            ])
          None -> react.none()
        },
      ]),
    ]),
    case account.pots {
      Some([_, ..] as pots) -> pots_section(pots, format)
      _ -> react.none()
    },
    case account.webhooks {
      Some([_, ..] as webhooks) -> webhooks_section(webhooks)
      _ -> react.none()
    },
  ])
}

fn pots_section(pots: List(Pot), format: fn(Int) -> String) -> Element {
  react.fragment([
    html.hr([a.class("dark:border-zinc-800")]),
    html.div([a.class("space-y-1.5 pb-2.5 pt-1.5")], [
      html.div([], [
        html.p([a.class("px-2.5 font-bold text-zinc-700 dark:text-zinc-200")], [
          html.text("Pots"),
        ]),
      ]),
      html.div(
        [a.class("flex w-full space-x-2.5 overflow-x-auto px-2.5")],
        pots
          |> list.filter(fn(pot) { !pot.deleted })
          |> list.map(fn(pot) { pot_card(pot, format) }),
      ),
    ]),
  ])
}

fn pot_card(pot: Pot, format: fn(Int) -> String) -> Element {
  html.div(
    [
      a.key(pot.id),
      a.class("shrink-0 grow border px-3 py-2 dark:border-zinc-800"),
    ],
    [
      html.p([a.class("text-zinc-700 dark:text-zinc-200")], [
        html.text(pot.name),
        case pot.round_up {
          Some(multiplier) ->
            html.span([a.class("text-sm text-zinc-500 dark:text-zinc-400")], [
              html.text(" "),
              html.text("("),
              html.text(multiplier),
              html.text("x)"),
            ])
          None -> react.none()
        },
      ]),
      html.p([a.class("text-lg")], [
        html.text(format(pot.balance)),
        case pot.goal_amount {
          Some(goal) ->
            html.span([a.class("text-zinc-400")], [
              html.text(" "),
              html.text("/ "),
              html.text(format(goal)),
            ])
          None -> react.none()
        },
      ]),
    ],
  )
}

fn webhooks_section(webhooks: List(Webhook)) -> Element {
  react.fragment([
    html.hr([a.class("border-zinc-800")]),
    html.div([a.class("space-y-2 py-2.5")], [
      html.p([a.class("px-2.5")], [html.text("Webhooks")]),
      html.div(
        [a.class("flex w-full space-x-2.5 overflow-x-auto px-2.5")],
        list.map(webhooks, fn(webhook) {
          html.div(
            [
              a.key(webhook.id),
              a.class("shrink-0 grow border border-zinc-800 px-3 py-2"),
            ],
            [
              html.p([a.class("text-zinc-200")], [html.text(webhook.url)]),
              html.p([a.class("text-sm text-zinc-400")], [html.text(webhook.id)]),
            ],
          )
        }),
      ),
    ]),
  ])
}

fn abs(n: Int) -> Int {
  case n < 0 {
    True -> -n
    False -> n
  }
}

pub fn get_server_side_props(
  context: ServerSidePropsContext,
) -> Promise(ServerSideProps(Dashboard)) {
  case page.cookie(context, "token") {
    None -> promise.resolve(to_login())
    Some(token) ->
      load(token)
      |> promise.map(fn(loaded) {
        case loaded {
          Ok(dashboard) -> page.server_side_props(dashboard)
          Error(Nil) -> to_login()
        }
      })
  }
}

fn to_login() -> ServerSideProps(Dashboard) {
  page.redirect("/api/oauth/monzo/redirect", permanent: False)
}

/// Load the accounts with the session's Monzo credentials. `Error` means
/// there is no usable session: send the user through the OAuth flow.
@external(javascript, "./monzo_dashboard_ffi.ts", "load")
fn load(token: String) -> Promise(Result(Dashboard, Nil))
