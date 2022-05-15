import {api} from '../../server/api';

export default api({
	async GET({res}) {
		res.throw(400, 'This error message was intentional.');
	},
});
