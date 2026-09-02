import type {GetStaticPropsContext} from 'next';

export const contextParams = (context: GetStaticPropsContext) => context.params ?? {};

// `props` is a JSON value built by a codec; Next serialises it as is.
export const staticProps = (props: unknown) => ({props});
export const staticPropsRevalidating = (props: unknown, revalidate: number) => ({
	props,
	revalidate,
});
export const notFound = () => ({notFound: true as const});
export const path = (params: unknown) => ({params});
export const staticPaths = (paths: object[], fallback: boolean) => ({paths, fallback});
export const staticPathsBlocking = (paths: object[]) => ({paths, fallback: 'blocking' as const});
export const serverProps = (props: unknown) => ({props});
export const redirect = (destination: string, permanent: boolean) => ({
	redirect: {destination, permanent},
});
