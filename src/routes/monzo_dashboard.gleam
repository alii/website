//// `pages/monzo/dashboard`: my Monzo accounts, behind the Monzo OAuth flow.

import attribute as a
import gleam/int
import gleam/javascript/array.{type Array}
import gleam/javascript/promise.{type Promise}
import gleam/list
import gleam/option.{None, Some}
import gleam/string
import html
import js.{type Nullable, type Thrown}
import next/link
import next/page.{type ServerSideProps, type ServerSidePropsContext}
import react.{type Element}
import site/monzo.{
  type Account, type Balance, type Body, type Dashboard, type Pot, type Webhook,
}

pub fn page(props: Dashboard) -> Element {
  case monzo.outcome(props) {
    Ok(success) -> dashboard(monzo.accounts(success))
    Error(failure) -> failure_view(monzo.error(failure), monzo.body(failure))
  }
}

fn failure_view(error: String, body: String) -> Element {
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
        |> list.filter(fn(account) { !monzo.closed(account) })
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
  let format = fn(pennies) { monzo.format(monzo.currency(account), pennies) }
  let kind = monzo.kind(account)

  html.div([a.key(monzo.id(account)), a.class("border dark:border-zinc-800")], [
    html.div([a.class("flex justify-between p-2.5")], [
      html.div([a.class("space-y-0.5")], [
        html.p([], [
          html.text(
            monzo.owners(account)
            |> list.map(monzo.preferred_first_name)
            |> string.join(", "),
          ),
          html.text(" ("),
          html.text(kind),
          html.text(")"),
        ]),
        case monzo.balance(account) {
          Some(balance) ->
            html.p([a.class("text-xl text-zinc-600 dark:text-zinc-300")], [
              html.text(format(monzo.balance_amount(balance))),
              html.text(" "),
              case monzo.spend_today(balance) {
                0 -> react.none()
                spend ->
                  html.span(
                    [a.class("text-sm text-zinc-500 dark:text-zinc-400")],
                    [
                      html.text("-"),
                      html.text(format(int.absolute_value(spend))),
                      html.text(" today"),
                    ],
                  )
              },
            ])
          None ->
            html.p([a.class("text-sm text-zinc-500 dark:text-zinc-400")], [
              html.text(case kind {
                "uk_monzo_flex_backing_loan" ->
                  "This is a loan account used for flex transactions. It has no balance and will be considered closed once the debt is paid off."
                _ -> "This type of acccount has no balance"
              }),
            ])
        },
      ]),
      html.div([a.class("flex flex-col items-end space-y-1")], [
        html.p([a.class("text-xs text-zinc-500")], [
          html.text(monzo.description(account)),
        ]),
        html.p([a.class("text-xs text-zinc-500")], [
          html.text(monzo.id(account)),
        ]),
        case monzo.payment_details(account) {
          Some(details) ->
            html.p([a.class("text-xs text-zinc-500")], [
              html.text(monzo.account_number(details)),
              html.text(" •"),
              html.text(" "),
              html.text(monzo.sort_code(details)),
            ])
          None -> react.none()
        },
      ]),
    ]),
    case monzo.pots(account) {
      Some([_, ..] as pots) -> pots_section(pots, format)
      _ -> react.none()
    },
    case monzo.webhooks(account) {
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
          |> list.filter(fn(pot) { !monzo.pot_deleted(pot) })
          |> list.map(fn(pot) { pot_card(pot, format) }),
      ),
    ]),
  ])
}

fn pot_card(pot: Pot, format: fn(Int) -> String) -> Element {
  html.div(
    [
      a.key(monzo.pot_id(pot)),
      a.class("shrink-0 grow border px-3 py-2 dark:border-zinc-800"),
    ],
    [
      html.p([a.class("text-zinc-700 dark:text-zinc-200")], [
        html.text(monzo.pot_name(pot)),
        case monzo.pot_round_up(pot) {
          True ->
            html.span([a.class("text-sm text-zinc-500 dark:text-zinc-400")], [
              html.text(" "),
              html.text("("),
              html.text(int.to_string(monzo.pot_round_up_multiplier(pot))),
              html.text("x)"),
            ])
          False -> react.none()
        },
      ]),
      html.p([a.class("text-lg")], [
        html.text(format(monzo.pot_balance(pot))),
        case monzo.pot_goal_amount(pot) {
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
              a.key(monzo.webhook_id(webhook)),
              a.class("shrink-0 grow border border-zinc-800 px-3 py-2"),
            ],
            [
              html.p([a.class("text-zinc-200")], [
                html.text(monzo.webhook_url(webhook)),
              ]),
              html.p([a.class("text-sm text-zinc-400")], [
                html.text(monzo.webhook_id(webhook)),
              ]),
            ],
          )
        }),
      ),
    ]),
  ])
}

// ---- server side ----------------------------------------------------------
// Everything below is only reachable from `get_server_side_props`, so Next
// drops it, and `monzo_dashboard_ffi.ts`, from the browser bundle.

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

/// A parsed session cookie.
type Session

/// A Monzo API client for one access token.
type Client

/// A failed request to Monzo.
type HttpClientError

@external(javascript, "./monzo_dashboard_ffi.ts", "parseSession")
fn parse_session(token: String) -> Nullable(Session)

@external(javascript, "./monzo_dashboard_ffi.ts", "monzoAccessToken")
fn monzo_access_token(session: Session) -> Nullable(String)

@external(javascript, "./monzo_dashboard_ffi.ts", "monzoClient")
fn monzo_client(access_token: String) -> Client

@external(javascript, "./monzo_dashboard_ffi.ts", "getAccounts")
fn get_accounts(client: Client) -> Promise(Array(Account))

@external(javascript, "./monzo_dashboard_ffi.ts", "getBalance")
fn get_balance(client: Client, account_id: String) -> Promise(Balance)

@external(javascript, "./monzo_dashboard_ffi.ts", "listWebhooks")
fn list_webhooks(client: Client, account_id: String) -> Promise(Array(Webhook))

@external(javascript, "./monzo_dashboard_ffi.ts", "getPots")
fn get_pots(client: Client, account_id: String) -> Promise(Array(Pot))

/// `{...account, pots, balance, webhooks}`
@external(javascript, "./monzo_dashboard_ffi.ts", "withExtras")
fn with_extras(
  account: Account,
  balance: Nullable(Balance),
  webhooks: Nullable(Array(Webhook)),
  pots: Nullable(Array(Pot)),
) -> Account

@external(javascript, "./monzo_dashboard_ffi.ts", "loaded")
fn success_props(accounts: Array(Account)) -> Dashboard

@external(javascript, "./monzo_dashboard_ffi.ts", "failed")
fn failure_props(error: String, body: Body) -> Dashboard

@external(javascript, "./monzo_dashboard_ffi.ts", "httpClientError")
fn http_client_error(thrown: Thrown) -> Nullable(HttpClientError)

@external(javascript, "./monzo_dashboard_ffi.ts", "errorMessage")
fn error_message(error: HttpClientError) -> String

@external(javascript, "./monzo_dashboard_ffi.ts", "errorResponseJson")
fn error_response_json(error: HttpClientError) -> Promise(Body)

/// Anything else thrown, made JSON-safe.
@external(javascript, "./monzo_dashboard_ffi.ts", "errorJsonValue")
fn error_json_value(thrown: Thrown) -> Body

/// Load the accounts with the session's Monzo credentials. `Error` means
/// there is no usable session: send the user through the OAuth flow.
fn load(token: String) -> Promise(Result(Dashboard, Nil)) {
  let access_token =
    parse_session(token)
    |> js.to_option
    |> option.then(fn(session) { js.to_option(monzo_access_token(session)) })

  case access_token {
    None -> promise.resolve(Error(Nil))
    Some(access_token) -> {
      let client = monzo_client(access_token)
      let attempt =
        get_accounts(client)
        |> promise.await(fn(accounts) {
          accounts
          |> array.to_list
          |> list.map(expand(client, _))
          |> promise.await_list
        })
        |> js.attempt

      use attempt <- promise.await(attempt)
      case attempt {
        Ok(accounts) ->
          promise.resolve(Ok(success_props(array.from_list(accounts))))
        Error(thrown) -> promise.map(failed_to_load(thrown), Ok)
      }
    }
  }
}

/// An open account with its balance, pots and webhooks fetched alongside.
/// The three are fetched at once; any that fails is `null`, like before.
fn expand(client: Client, account: Account) -> Promise(Account) {
  case monzo.closed(account) {
    True -> promise.resolve(account)
    False -> {
      let id = monzo.id(account)
      let balance = or_null(get_balance(client, id))
      let webhooks = or_null(list_webhooks(client, id))
      let pots = or_null(get_pots(client, id))
      use balance <- promise.await(balance)
      use webhooks <- promise.await(webhooks)
      use pots <- promise.await(pots)
      promise.resolve(with_extras(account, balance, webhooks, pots))
    }
  }
}

fn or_null(fetched: Promise(a)) -> Promise(Nullable(a)) {
  js.attempt(fetched)
  |> promise.map(fn(result) { js.from_option(option.from_result(result)) })
}

fn failed_to_load(thrown: Thrown) -> Promise(Dashboard) {
  case js.to_option(http_client_error(thrown)) {
    Some(error) ->
      error_response_json(error)
      |> promise.map(failure_props(error_message(error), _))
    None ->
      promise.resolve(failure_props(
        "An unknown error occurred",
        error_json_value(thrown),
      ))
  }
}
