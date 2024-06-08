import {NextkitError} from 'nextkit';
import {z} from 'zod';
import {api} from '../../server/api';
import {getMapURL} from '../../server/apple-maps';

const querySchema = z.object({
	theme: z.union([z.literal('light'), z.literal('dark')]),
});

export default api({
	GET: async ({ctx, req}) => {
		const lanyard = await ctx.lanyard.get();

		if (!lanyard.kv.location) {
			throw new NextkitError(404, 'No location found');
		}

		const {theme} = querySchema.parse(req.query);

		return {
			_redirect: getMapURL(lanyard.kv.location, theme),
		};
	},
});
