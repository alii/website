import {z} from 'zod';
import {api} from '../../../../server/api';
import {monzoOAuthAPI} from '../../../../server/monzo';

const toRedirectUrlSchema = z.union([
	z.literal('monzo').transform(() => monzoOAuthAPI.getOAuthURL().url),
	z.literal('example').transform(() => 'https://example.com'),
]);

const urlSchema = z
	.object({
		platform: toRedirectUrlSchema,
	})
	.transform(result => result.platform);

export default api({
	async GET({req}) {
		const result = urlSchema.safeParse(req.query);

		if (!result.success) {
			return {
				_redirect: '/oauth/error?message=Invalid%20platform',
			};
		}

		return {
			_redirect: result.data,
		};
	},
});
