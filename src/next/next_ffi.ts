import {Some, type Option$} from '@gleam/gleam_stdlib/gleam/option.mjs';
import type {List} from '@gleam/prelude.mjs';
import type {GetServerSidePropsContext, GetStaticPropsContext} from 'next';
import type {AppProps} from 'next/app';
import Head from 'next/head';
import Link from 'next/link';
import {toOption} from '../js_ffi.ts';

export const link = () => Link;

export const component = (props: AppProps) => props.Component;
export const pageProps = (props: AppProps) => props.pageProps;
export const head = () => Head;

// Next insists getStaticProps results are plain objects. A Gleam record is a
// class instance, so spread its fields into a fresh object.
export function staticProps<Props extends object>(props: Props, revalidate: Option$<number>) {
	const result: {props: Props; revalidate?: number} = {props: {...props}};
	if (revalidate instanceof Some) result.revalidate = revalidate[0];
	return result;
}

export const notFound = () => ({notFound: true as const});

export function staticPaths<Params extends object>(params: List<Params>, fallback: string) {
	return {
		paths: params.toArray().map(p => ({params: {...p}})),
		fallback: fallback === 'blocking' ? ('blocking' as const) : fallback === 'true',
	};
}

export function serverSideProps<Props extends object>(props: Props) {
	return {props: {...props}};
}

export function param(context: GetStaticPropsContext, name: string) {
	const value = context.params?.[name];
	return toOption(typeof value === 'string' ? value : undefined);
}

export const cookie = (context: GetServerSidePropsContext, name: string) =>
	toOption(context.req.cookies[name]);
