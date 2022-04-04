import {NextkitError} from 'nextkit';
import {api} from '../../server/api';

export default api({
	async GET() {
		throw new NextkitError(400, 'This error message was intentional.');
	},
});
