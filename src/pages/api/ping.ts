import {api} from 'nextkit';

export default api({
	async GET() {
		return {
			ping: 'pong',
			time: Date.now(),
		};
	},
});
