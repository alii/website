import {api} from '../../server/api';

export default api({
	async GET() {
		return {
			ping: 'pong',
			time: Date.now(),
		};
	},
});
