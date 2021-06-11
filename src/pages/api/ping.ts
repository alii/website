import {api, InferAPIResponseType} from 'nextkit';

const handler = api<{ping: 'pong'; time: number}>({
	async GET() {
		return {
			ping: 'pong',
			time: Date.now(),
		};
	},
});

export default handler;
export type HandlerResponse = InferAPIResponseType<typeof handler>;
