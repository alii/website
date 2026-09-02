//// A codec describes the shape of a value once and gives both directions:
//// Gleam to JSON on the server, JSON back to Gleam in the browser. Pages
//// describe their props with one, and `next/runtime` applies it at the
//// boundary, so a page only ever sees its own record types.

import gleam/dynamic/decode.{type Decoder}
import gleam/json.{type Json}
import gleam/option.{type Option}

pub opaque type Codec(a) {
  Codec(encode: fn(a) -> Json, decoder: Decoder(a))
}

pub fn encode(codec: Codec(a), value: a) -> Json {
  codec.encode(value)
}

pub fn decoder(codec: Codec(a)) -> Decoder(a) {
  codec.decoder
}

/// For a type whose JSON form its own module vouches for.
pub fn custom(
  encode encode: fn(a) -> Json,
  decoder decoder: Decoder(a),
) -> Codec(a) {
  Codec(encode:, decoder:)
}

pub fn string() -> Codec(String) {
  Codec(json.string, decode.string)
}

pub fn int() -> Codec(Int) {
  Codec(json.int, decode.int)
}

pub fn float() -> Codec(Float) {
  Codec(json.float, decode.float)
}

pub fn bool() -> Codec(Bool) {
  Codec(json.bool, decode.bool)
}

/// `None` is `null`.
pub fn option(inner: Codec(a)) -> Codec(Option(a)) {
  Codec(
    encode: fn(value) { json.nullable(value, inner.encode) },
    decoder: decode.optional(inner.decoder),
  )
}

pub fn list(inner: Codec(a)) -> Codec(List(a)) {
  Codec(
    encode: fn(values) { json.array(values, inner.encode) },
    decoder: decode.list(inner.decoder),
  )
}

/// One field of a record: its JSON name, its codec, and how to read it off
/// the record.
pub opaque type Field(record, a) {
  Field(name: String, codec: Codec(a), get: fn(record) -> a)
}

pub fn field(
  name: String,
  codec: Codec(a),
  get: fn(record) -> a,
) -> Field(record, a) {
  Field(name:, codec:, get:)
}

fn encode_field(field: Field(record, a), record: record) -> #(String, Json) {
  #(field.name, field.codec.encode(field.get(record)))
}

pub fn object1(
  construct: fn(a) -> record,
  f1: Field(record, a),
) -> Codec(record) {
  Codec(
    encode: fn(record) { json.object([encode_field(f1, record)]) },
    decoder: {
      use a <- decode.field(f1.name, f1.codec.decoder)
      decode.success(construct(a))
    },
  )
}

pub fn object2(
  construct: fn(a, b) -> record,
  f1: Field(record, a),
  f2: Field(record, b),
) -> Codec(record) {
  Codec(
    encode: fn(record) {
      json.object([encode_field(f1, record), encode_field(f2, record)])
    },
    decoder: {
      use a <- decode.field(f1.name, f1.codec.decoder)
      use b <- decode.field(f2.name, f2.codec.decoder)
      decode.success(construct(a, b))
    },
  )
}

pub fn object3(
  construct: fn(a, b, c) -> record,
  f1: Field(record, a),
  f2: Field(record, b),
  f3: Field(record, c),
) -> Codec(record) {
  Codec(
    encode: fn(record) {
      json.object([
        encode_field(f1, record),
        encode_field(f2, record),
        encode_field(f3, record),
      ])
    },
    decoder: {
      use a <- decode.field(f1.name, f1.codec.decoder)
      use b <- decode.field(f2.name, f2.codec.decoder)
      use c <- decode.field(f3.name, f3.codec.decoder)
      decode.success(construct(a, b, c))
    },
  )
}

pub fn object4(
  construct: fn(a, b, c, d) -> record,
  f1: Field(record, a),
  f2: Field(record, b),
  f3: Field(record, c),
  f4: Field(record, d),
) -> Codec(record) {
  Codec(
    encode: fn(record) {
      json.object([
        encode_field(f1, record),
        encode_field(f2, record),
        encode_field(f3, record),
        encode_field(f4, record),
      ])
    },
    decoder: {
      use a <- decode.field(f1.name, f1.codec.decoder)
      use b <- decode.field(f2.name, f2.codec.decoder)
      use c <- decode.field(f3.name, f3.codec.decoder)
      use d <- decode.field(f4.name, f4.codec.decoder)
      decode.success(construct(a, b, c, d))
    },
  )
}
