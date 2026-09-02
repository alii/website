import type {GetServerSidePropsContext} from 'next';

export const cookie = (request: GetServerSidePropsContext, name: string) =>
	request.req.cookies[name];
