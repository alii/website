import Link from "next/link";
import { Some } from "../../gleam_stdlib/gleam/option.mjs";

export const link = () => Link;

// Next insists getStaticProps results are plain objects. A Gleam record is a
// class instance, so spread its fields into a fresh object.
export function staticProps(props, revalidate) {
  const result = { props: { ...props } };
  if (revalidate instanceof Some) result.revalidate = revalidate[0];
  return result;
}
