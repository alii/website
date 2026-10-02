import api
import gleam/io
import gleam/javascript/array.{type Array}
import gleam/javascript/promise.{type Promise}
import gleam/json
import gleam/list
import js

pub type ResponseWriter

pub type WebResponse

@external(javascript, "./runtime_ffi.ts", "setStatus")
fn set_status(writer: ResponseWriter, status: Int) -> Nil

@external(javascript, "./runtime_ffi.ts", "setHeader")
fn set_header(writer: ResponseWriter, name: String, value: String) -> Nil

@external(javascript, "./runtime_ffi.ts", "end")
fn end(writer: ResponseWriter, body: String) -> Nil

@external(javascript, "./runtime_ffi.ts", "sendRedirect")
fn send_redirect(writer: ResponseWriter, to: String) -> Nil

@external(javascript, "./runtime_ffi.ts", "webResponse")
fn web_response(
  status: Int,
  headers: Array(#(String, String)),
  body: String,
) -> WebResponse

@external(javascript, "./runtime_ffi.ts", "thrownMessage")
fn thrown_message(thrown: js.Thrown) -> String

/// A pages-router API route: `(req, res)`.
pub fn api(
  handle: fn(api.Request) -> Promise(api.Response),
  request: api.Request,
  writer: ResponseWriter,
) -> Promise(Nil) {
  use outcome <- promise.map(js.attempt(handle(request)))
  case outcome {
    Ok(response) -> write(writer, response)
    Error(thrown) -> {
      let message = thrown_message(thrown)
      io.println_error(message)
      write(writer, api.error(500, message))
    }
  }
}

fn write(writer: ResponseWriter, response: api.Response) -> Nil {
  let api.Response(status, headers, body) = response
  list.each(headers, fn(header) { set_header(writer, header.0, header.1) })
  case body {
    api.Json(value) -> {
      set_header(writer, "Content-Type", "application/json; charset=utf-8")
      set_status(writer, status)
      end(writer, json.to_string(value))
    }
    api.Text(value) -> {
      set_status(writer, status)
      end(writer, value)
    }
    api.Redirect(to) -> send_redirect(writer, to)
    api.Empty -> {
      set_status(writer, status)
      end(writer, "")
    }
  }
}

/// An app-router route handler: returns a web `Response`.
pub fn route(get: fn() -> api.Response) -> WebResponse {
  let api.Response(status, headers, body) = get()
  let body = case body {
    api.Text(value) -> value
    api.Json(value) -> json.to_string(value)
    api.Redirect(_) | api.Empty -> ""
  }
  web_response(status, array.from_list(headers), body)
}
