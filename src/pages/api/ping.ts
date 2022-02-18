import {api} from '../../server/api';
import {id} from 'alistair/id';

export default api({
	async GET() {
		return {
			ping: 'pong',
			time: Date.now(),
			id: id(),
		};
	},
});
