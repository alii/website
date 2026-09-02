import { None, Some } from "../gleam_stdlib/gleam/option.mjs";

export const toOption = (value) =>
  value === null || value === undefined ? new None() : new Some(value);

export const fromOption = (option) => (option instanceof Some ? option[0] : null);

export const get = (object, property) => object[property];
