//// An API route module exports `handle(request) -> Promise(Response)`;
//// `next/runtime` serves it. An app-router route exports `get() -> Response`.

import gleam/dynamic.{type Dynamic}
import gleam/http.{type Method}
import gleam/javascript/promise.{type Promise}
import gleam/json.{type Json}
import gleam/option.{type Option}
import gleam/result
import js.{type Nullable}

pub type Request

@external(javascript, "./api_ffi.ts", "method")
fn method_raw(request: Request) -> String

pub fn method(request: Request) -> Method {
  let name = method_raw(request)
  http.parse_method(name) |> result.unwrap(http.Other(name))
}

@external(javascript, "./api_ffi.ts", "query")
fn query_raw(request: Request, name: String) -> Nullable(String)

pub fn query(request: Request, name: String) -> Option(String) {
  js.to_option(query_raw(request, name))
}

@external(javascript, "./api_ffi.ts", "header")
fn header_raw(request: Request, name: String) -> Nullable(String)

pub fn header(request: Request, name: String) -> Option(String) {
  js.to_option(header_raw(request, name))
}

@external(javascript, "./api_ffi.ts", "remoteAddress")
fn remote_address_raw(request: Request) -> Nullable(String)

pub fn remote_address(request: Request) -> Option(String) {
  js.to_option(remote_address_raw(request))
}

/// The parsed JSON body: untrusted input, so it must be decoded.
@external(javascript, "./api_ffi.ts", "body")
pub fn body(request: Request) -> Dynamic

pub type Response {
  Response(status: Int, headers: List(#(String, String)), body: Body)
}

pub type Body {
  Json(Json)
  Text(String)
  Redirect(to: String)
  Empty
}

/// `{success: true, data, status: 200, message: null}`, as the API always has.
pub fn ok(data: Json) -> Response {
  Response(
    200,
    [],
    Json(
      json.object([
        #("success", json.bool(True)),
        #("data", data),
        #("status", json.int(200)),
        #("message", json.null()),
      ]),
    ),
  )
}

/// `{status, message, data: null, success: false}`, as the API always has.
pub fn error(status: Int, message: String) -> Response {
  Response(
    status,
    [],
    Json(
      json.object([
        #("status", json.int(status)),
        #("message", json.string(message)),
        #("data", json.null()),
        #("success", json.bool(False)),
      ]),
    ),
  )
}

pub fn redirect(to: String) -> Response {
  Response(307, [], Redirect(to))
}

pub fn text(status: Int, content_type: String, body: String) -> Response {
  Response(status, [#("Content-Type", content_type)], Text(body))
}

pub fn with_header(
  response: Response,
  name: String,
  value: String,
) -> Response {
  Response(..response, headers: [#(name, value), ..response.headers])
}

/// Serve `method` only; anything else is a 405 with the message the API always gave.
pub fn only(
  request: Request,
  wanted: Method,
  handler: fn() -> Promise(Response),
) -> Promise(Response) {
  case method(request) == wanted {
    True -> handler()
    False ->
      promise.resolve(error(
        405,
        "Cannot " <> method_raw(request) <> " this route",
      ))
  }
}
