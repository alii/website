//// Hand-rolled: gleam_time would add far more to the browser bundle than this.

import gleam/int
import gleam/string

const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov",
  "Dec",
]

// en-GB spells September "Sept"
const months_en_gb = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov",
  "Dec",
]

/// Milliseconds since the Unix epoch.
@external(javascript, "./date_ffi.ts", "now")
pub fn now() -> Int

/// Midnight UTC on that day, in milliseconds since the Unix epoch.
pub fn utc(year: Int, month: Int, day: Int) -> Int {
  days_from_civil(year, month, day) * 86_400_000
}

pub fn current_year() -> Int {
  let #(year, _month, _day) = civil(now())
  year
}

pub const day_ms = 86_400_000

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

/// "2026-08-21T00:00:00.000Z", like `Date#toISOString`
pub fn iso(ms: Int) -> String {
  let #(year, month, day) = civil(ms)
  let #(hours, minutes, seconds, millis) = clock(ms)
  int.to_string(year)
  <> "-"
  <> pad(month, 2)
  <> "-"
  <> pad(day, 2)
  <> "T"
  <> pad(hours, 2)
  <> ":"
  <> pad(minutes, 2)
  <> ":"
  <> pad(seconds, 2)
  <> "."
  <> pad(millis, 3)
  <> "Z"
}

/// "Fri, 21 Aug 2026 00:00:00 GMT", like `Date#toUTCString`
pub fn http(ms: Int) -> String {
  let days = floor_div(ms, day_ms)
  let #(year, month, day) = civil_from_days(days)
  let #(hours, minutes, seconds, _millis) = clock(ms)
  let assert Ok(weekday) = at(weekdays, floor_mod(days + 4, 7))
  let assert Ok(month) = at(months, month - 1)
  weekday
  <> ", "
  <> pad(day, 2)
  <> " "
  <> month
  <> " "
  <> int.to_string(year)
  <> " "
  <> pad(hours, 2)
  <> ":"
  <> pad(minutes, 2)
  <> ":"
  <> pad(seconds, 2)
  <> " GMT"
}

fn clock(ms: Int) -> #(Int, Int, Int, Int) {
  let in_day = floor_mod(ms, day_ms)
  #(in_day / 3_600_000, in_day / 60_000 % 60, in_day / 1000 % 60, in_day % 1000)
}

fn pad(n: Int, width: Int) -> String {
  string.pad_start(int.to_string(n), width, "0")
}

fn floor_mod(a: Int, b: Int) -> Int {
  a - floor_div(a, b) * b
}

/// "12 Aug 2026"
pub fn format_utc(ms: Int) -> String {
  let #(year, month, day) = civil(ms)
  let assert Ok(month) = at(months, month - 1)
  int.to_string(day) <> " " <> month <> " " <> int.to_string(year)
}

/// "Aug 2026", "Sept 2022"
pub fn month_year(ms: Int) -> String {
  let #(year, month, _day) = civil(ms)
  let assert Ok(month) = at(months_en_gb, month - 1)
  month <> " " <> int.to_string(year)
}

fn civil(ms: Int) -> #(Int, Int, Int) {
  civil_from_days(floor_div(ms, 86_400_000))
}

/// Howard Hinnant's algorithm: days since 1970-01-01 to (year, month, day).
fn civil_from_days(days: Int) -> #(Int, Int, Int) {
  let z = days + 719_468
  let era = floor_div(z, 146_097)
  let doe = z - era * 146_097
  let yoe = { doe - doe / 1460 + doe / 36_524 - doe / 146_096 } / 365
  let doy = doe - { 365 * yoe + yoe / 4 - yoe / 100 }
  let mp = { 5 * doy + 2 } / 153
  let day = doy - { 153 * mp + 2 } / 5 + 1
  let month = case mp < 10 {
    True -> mp + 3
    False -> mp - 9
  }
  let year = yoe + era * 400
  let year = case month <= 2 {
    True -> year + 1
    False -> year
  }
  #(year, month, day)
}

fn days_from_civil(year: Int, month: Int, day: Int) -> Int {
  let year = case month <= 2 {
    True -> year - 1
    False -> year
  }
  let era = floor_div(year, 400)
  let yoe = year - era * 400
  let mp = case month > 2 {
    True -> month - 3
    False -> month + 9
  }
  let doy = { 153 * mp + 2 } / 5 + day - 1
  let doe = yoe * 365 + yoe / 4 - yoe / 100 + doy
  era * 146_097 + doe - 719_468
}

fn floor_div(a: Int, b: Int) -> Int {
  let q = a / b
  case a % b < 0 {
    True -> q - 1
    False -> q
  }
}

fn at(list: List(a), index: Int) -> Result(a, Nil) {
  case list, index {
    [], _ -> Error(Nil)
    [first, ..], 0 -> Ok(first)
    [_, ..rest], n -> at(rest, n - 1)
  }
}
