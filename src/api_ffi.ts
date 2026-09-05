import type {NextApiRequest} from 'next';

export const method = (request: NextApiRequest) => request.method ?? 'n/a';
export const query = (request: NextApiRequest, name: string) => {
	const value = request.query[name];
	return typeof value === 'string' ? value : undefined;
};
export const header = (request: NextApiRequest, name: string) => {
	const value = request.headers[name];
	return typeof value === 'string' ? value : undefined;
};
export const remoteAddress = (request: NextApiRequest) => request.socket.remoteAddress;
export const body = (request: NextApiRequest): unknown => request.body;
