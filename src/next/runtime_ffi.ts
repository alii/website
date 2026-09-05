import type {GetStaticPropsContext, NextApiResponse} from 'next';

export const contextParams = (context: GetStaticPropsContext) => context.params ?? {};

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

export const setStatus = (response: NextApiResponse, status: number) =>
	void response.status(status);
export const setHeader = (response: NextApiResponse, name: string, value: string) =>
	void response.setHeader(name, value);
export const end = (response: NextApiResponse, body: string) => void response.end(body);
export const sendRedirect = (response: NextApiResponse, to: string) => void response.redirect(to);
export const webResponse = (status: number, headers: [string, string][], body: string) =>
	new Response(body, {status, headers: Object.fromEntries(headers)});
export const thrownMessage = (error: unknown) =>
	error instanceof Error ? error.message : String(error);
