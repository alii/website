import type {GetServerSidePropsContext, GetStaticPropsContext} from 'next';
import type {AppProps} from 'next/app';
import Head from 'next/head';
import Link from 'next/link';

export const link = () => Link;
export const head = () => Head;

export const component = (props: AppProps) => props.Component;
export const pageProps = (props: AppProps) => props.pageProps;

export const param = (context: GetStaticPropsContext, name: string) => {
	const value = context.params?.[name];
	return typeof value === 'string' ? value : undefined;
};

export const cookie = (context: GetServerSidePropsContext, name: string) =>
	context.req.cookies[name];
