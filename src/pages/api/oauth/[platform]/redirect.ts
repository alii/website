import {z} from 'zod';
import {api} from '../../../../server/api';
import {monzoOAuthAPI} from '../../../../server/monzo';

const toRedirectUrlSchema = z.literal('monzo').transform(() => monzoOAuthAPI.getOAuthURL());

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
			_redirect: result.data.url,
		};
	},
});
