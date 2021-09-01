import {api} from 'nextkit';

export default api<{ping: 'pong'; time: number}>({
	async GET() {
		return {
			ping: 'pong',
			time: Date.now(),
		};
	},
});
