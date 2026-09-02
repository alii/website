//// Hand-rolled: gleam_time would add far more to the browser bundle than this.

import gleam/int

const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov",
  "Dec",
]

// en-GB spells September "Sept"
const months_en_gb = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov",
  "Dec",
]

@external(javascript, "./date_ffi.ts", "now")
fn now_ms() -> Int

pub fn current_year() -> Int {
  let #(year, _month, _day) = civil(now_ms())
  year
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
