import {Some, type Option$} from '@gleam/gleam_stdlib/gleam/option.mjs';
import Link from 'next/link';

export const link = () => Link;

// Next insists getStaticProps results are plain objects. A Gleam record is a
// class instance, so spread its fields into a fresh object.
export function staticProps<Props extends object>(props: Props, revalidate: Option$<number>) {
	const result: {props: Props; revalidate?: number} = {props: {...props}};
	if (revalidate instanceof Some) result.revalidate = revalidate[0];
	return result;
}
