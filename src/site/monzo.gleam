//// The Monzo dashboard's data: the page's JSON props and the Monzo API
//// objects inside them, all opaque, read through `monzo_ffi.ts`.

import codec.{type Codec}
import gleam/dynamic.{type Dynamic}
import gleam/dynamic/decode
import gleam/int
import gleam/javascript/array.{type Array}
import gleam/json.{type Json}
import gleam/option.{type Option, None, Some}
import gleam/string
import js.{type Nullable}

/// The page's props as Next stores them.
pub type Dashboard

/// The props when the accounts loaded.
pub type Success

/// The props when they did not.
pub type Failure

@external(javascript, "./monzo_ffi.ts", "success")
fn success(dashboard: Dashboard) -> Nullable(Success)

@external(javascript, "./monzo_ffi.ts", "failure")
fn failure(dashboard: Dashboard) -> Nullable(Failure)

pub fn outcome(dashboard: Dashboard) -> Result(Success, Failure) {
  case js.to_option(success(dashboard)), js.to_option(failure(dashboard)) {
    Some(success), _ -> Ok(success)
    _, Some(failure) -> Error(failure)
    None, None -> panic as "dashboard props are neither success nor failure"
  }
}

@external(javascript, "./monzo_ffi.ts", "accounts")
fn accounts_raw(success: Success) -> Array(Account)

pub fn accounts(success: Success) -> List(Account) {
  array.to_list(accounts_raw(success))
}

@external(javascript, "./monzo_ffi.ts", "error")
pub fn error(failure: Failure) -> String

/// The error response from Monzo, whatever shape it has.
pub type Body

@external(javascript, "./monzo_ffi.ts", "body")
fn body_raw(failure: Failure) -> Body

/// The error response, pretty-printed.
pub fn body(failure: Failure) -> String {
  js.json(body_raw(failure), 4)
  |> js.to_option
  |> option.unwrap("")
}

pub type Account

pub type Owner

pub type Balance

pub type Pot

pub type Webhook

pub type PaymentDetails

@external(javascript, "./monzo_ffi.ts", "id")
pub fn id(account: Account) -> String

/// `uk_retail`, `uk_monzo_flex_backing_loan`, and so on.
@external(javascript, "./monzo_ffi.ts", "kind")
pub fn kind(account: Account) -> String

@external(javascript, "./monzo_ffi.ts", "description")
pub fn description(account: Account) -> String

@external(javascript, "./monzo_ffi.ts", "closed")
pub fn closed(account: Account) -> Bool

@external(javascript, "./monzo_ffi.ts", "currency")
pub fn currency(account: Account) -> String

@external(javascript, "./monzo_ffi.ts", "owners")
fn owners_raw(account: Account) -> Array(Owner)

pub fn owners(account: Account) -> List(Owner) {
  array.to_list(owners_raw(account))
}

@external(javascript, "./monzo_ffi.ts", "preferredFirstName")
pub fn preferred_first_name(owner: Owner) -> String

@external(javascript, "./monzo_ffi.ts", "balance")
fn balance_raw(account: Account) -> Nullable(Balance)

pub fn balance(account: Account) -> Option(Balance) {
  js.to_option(balance_raw(account))
}

@external(javascript, "./monzo_ffi.ts", "pots")
fn pots_raw(account: Account) -> Nullable(Array(Pot))

pub fn pots(account: Account) -> Option(List(Pot)) {
  option.map(js.to_option(pots_raw(account)), array.to_list)
}

@external(javascript, "./monzo_ffi.ts", "webhooks")
fn webhooks_raw(account: Account) -> Nullable(Array(Webhook))

pub fn webhooks(account: Account) -> Option(List(Webhook)) {
  option.map(js.to_option(webhooks_raw(account)), array.to_list)
}

@external(javascript, "./monzo_ffi.ts", "paymentDetails")
fn payment_details_raw(account: Account) -> Nullable(PaymentDetails)

pub fn payment_details(account: Account) -> Option(PaymentDetails) {
  js.to_option(payment_details_raw(account))
}

/// Pennies.
@external(javascript, "./monzo_ffi.ts", "balanceAmount")
pub fn balance_amount(balance: Balance) -> Int

/// Pennies, negative for spending.
@external(javascript, "./monzo_ffi.ts", "spendToday")
pub fn spend_today(balance: Balance) -> Int

@external(javascript, "./monzo_ffi.ts", "potId")
pub fn pot_id(pot: Pot) -> String

@external(javascript, "./monzo_ffi.ts", "potName")
pub fn pot_name(pot: Pot) -> String

@external(javascript, "./monzo_ffi.ts", "potDeleted")
pub fn pot_deleted(pot: Pot) -> Bool

@external(javascript, "./monzo_ffi.ts", "potRoundUp")
pub fn pot_round_up(pot: Pot) -> Bool

@external(javascript, "./monzo_ffi.ts", "potRoundUpMultiplier")
pub fn pot_round_up_multiplier(pot: Pot) -> Int

/// Pennies.
@external(javascript, "./monzo_ffi.ts", "potBalance")
pub fn pot_balance(pot: Pot) -> Int

@external(javascript, "./monzo_ffi.ts", "potGoalAmount")
fn pot_goal_amount_raw(pot: Pot) -> Nullable(Int)

/// Pennies, if the pot has a goal.
pub fn pot_goal_amount(pot: Pot) -> Option(Int) {
  js.to_option(pot_goal_amount_raw(pot))
}

@external(javascript, "./monzo_ffi.ts", "webhookId")
pub fn webhook_id(webhook: Webhook) -> String

@external(javascript, "./monzo_ffi.ts", "webhookUrl")
pub fn webhook_url(webhook: Webhook) -> String

@external(javascript, "./monzo_ffi.ts", "accountNumber")
pub fn account_number(details: PaymentDetails) -> String

@external(javascript, "./monzo_ffi.ts", "sortCode")
pub fn sort_code(details: PaymentDetails) -> String

@external(javascript, "./monzo_ffi.ts", "formatCurrency")
fn format_currency(currency: String, amount: Float) -> String

/// Pennies as a currency string: "£12.34", or "£12" for a whole amount.
pub fn format(currency: String, pennies: Int) -> String {
  let formatted = format_currency(currency, int.to_float(pennies) /. 100.0)
  case string.ends_with(formatted, ".00") {
    True -> string.drop_end(formatted, 3)
    False -> formatted
  }
}

/// The dashboard props are JSON built on the server, and cross the
/// server-to-browser boundary as themselves.
pub fn codec() -> Codec(Dashboard) {
  codec.custom(encode: as_json, decoder: decode.map(decode.dynamic, from_json))
}

@external(javascript, "../js_ffi.ts", "identity")
fn as_json(value: Dashboard) -> Json

@external(javascript, "../js_ffi.ts", "identity")
fn from_json(json: Dynamic) -> Dashboard
