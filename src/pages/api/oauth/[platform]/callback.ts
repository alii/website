import {z} from 'zod';
import {api} from '../../../../server/api';
import {monzoOAuthAPI} from '../../../../server/monzo';

const querySchema = z.object({
	code: z.string(),
});

export default api({
	async GET({req}) {
		const result = querySchema.safeParse(req.query);

		if (!result.success) {
			return {
				_redirect: '/oauth/error?message=Invalid%20code',
			};
		}

		const api = await monzoOAuthAPI.exchangeAuthorizationCode(result.data.code);

		console.log(api.credentials);

		return api.credentials;
	},
});
