// `bun:bake` and the page data functions of `bun bake`'s default framework. Bun has no published
// types for either yet; these follow the Bake RFC (https://github.com/alii/bake-rfc).
declare module 'bun:bake' {
	/** Returns `config` as it is. `bun bake` reads only `plugins` from bake.config.ts. */
	export function defineConfig<T extends {plugins?: import('bun').BunPlugin[]}>(config: T): T;

	type Params = Record<string, string | string[]>;

	export type GetStaticPaths = () => Promise<{
		paths: {params: Params}[];
		fallback: false | 'blocking';
	}>;

	export type GetStaticProps<Props> = (ctx: {
		params: Params;
	}) => Promise<{props: Props; revalidate?: number | false} | {notFound: true}>;

	export type GetServerSideProps<Props> = (ctx: {
		params: Params;
		request: Request;
	}) => Promise<
		{props: Props} | {notFound: true} | {redirect: {destination: string; permanent: boolean}}
	>;

	export type Redirect = {destination: string; permanent: boolean};
}

// A font or image file imported from code is the URL of its bundled copy.
declare module '*.woff2' {
	const url: string;
	export default url;
}

declare module '*.png' {
	const url: string;
	export default url;
}

declare module '*.jpeg' {
	const url: string;
	export default url;
}
