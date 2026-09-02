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

// A Gleam record is a class instance; Next wants plain objects, hence the spreads.
export const staticProps = <P extends object>(props: P) => ({props: {...props}});
export const staticPropsRevalidating = <P extends object>(props: P, revalidate: number) => ({
	props: {...props},
	revalidate,
});
export const notFound = () => ({notFound: true as const});
export const prerenderedPath = <P extends object>(params: P) => ({params: {...params}});
export const staticPaths = (paths: object[], fallback: boolean) => ({paths, fallback});
export const staticPathsBlocking = (paths: object[]) => ({paths, fallback: 'blocking' as const});
export const serverSideProps = <P extends object>(props: P) => ({props: {...props}});
export const redirect = (destination: string, permanent: boolean) => ({
	redirect: {destination, permanent},
});
