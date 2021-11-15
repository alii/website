import {HttpException} from 'nextkit';
import {api} from '../../server/api';

export default api({
	async GET() {
		throw new HttpException(400, 'This error message was intentional.');
	},
});
