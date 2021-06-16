import {api, HttpException} from 'nextkit';

export default api({
	async GET() {
		throw new HttpException(400, 'This error message was intentional.');
	},
});
