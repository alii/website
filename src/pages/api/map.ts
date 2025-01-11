import {NextkitError} from 'nextkit';
import {api} from '../../server/api';
import {getMapURL} from '../../server/apple-maps';

export default api({
	GET: async ({ctx}) => {
		const lanyard = await ctx.lanyard.get();

		if (!lanyard.kv.location) {
			throw new NextkitError(404, 'No location found');
		}

		return {
			_redirect: getMapURL(lanyard.kv.location),
		};
	},
});
