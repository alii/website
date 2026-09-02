//// What the Monzo dashboard renders. `monzo_ffi.ts` builds these records
//// from the page's JSON props, typed against the Monzo API types there.

import gleam/option.{type Option}

/// The page's props as Next stores them (plain JSON).
pub type Dashboard

/// The accounts to show, or why loading them failed.
@external(javascript, "./monzo_ffi.ts", "accounts")
pub fn accounts(dashboard: Dashboard) -> Result(List(Account), Failure)

pub type Failure {
  Failure(error: String, body: String)
}

pub type Account {
  Account(
    id: String,
    kind: String,
    description: String,
    closed: Bool,
    currency: String,
    owner_names: List(String),
    balance: Option(Balance),
    pots: Option(List(Pot)),
    webhooks: Option(List(Webhook)),
    payment_details: Option(PaymentDetails),
  )
}

/// Amounts are in pennies.
pub type Balance {
  Balance(balance: Int, spend_today: Int)
}

pub type Pot {
  Pot(
    id: String,
    name: String,
    deleted: Bool,
    /// The round-up multiplier, rendered as JS would, when round-up is on.
    round_up: Option(String),
    balance: Int,
    goal_amount: Option(Int),
  )
}

pub type Webhook {
  Webhook(id: String, url: String)
}

pub type PaymentDetails {
  PaymentDetails(account_number: String, sort_code: String)
}

/// Pennies as a currency string, e.g. "£12.34" or "£12".
@external(javascript, "./monzo_ffi.ts", "format")
pub fn format(currency: String, pennies: Int) -> String
