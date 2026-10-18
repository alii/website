// The page data functions of `bun bake`'s default framework. Bun has no published types for
// `bun:bake` yet; these follow the Bake RFC (https://github.com/alii/bake-rfc).
declare module 'bun:bake' {
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
