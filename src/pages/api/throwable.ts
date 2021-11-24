import {NextkitException} from 'nextkit';
import {api} from '../../server/api';

export default api({
	async GET() {
		throw new NextkitException(400, 'This error message was intentional.');
	},
});
