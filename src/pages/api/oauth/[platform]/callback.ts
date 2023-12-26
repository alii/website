import {z} from 'zod';
import {api} from '../../../../server/api';
import {monzoOAuthAPI} from '../../../../server/monzo';
import {createSessionJWT, getCookieHeader} from '../../../../server/sessions';

const querySchema = z.object({
	code: z.string(),
});

export default api({
	async GET({req, res}) {
		const result = querySchema.safeParse(req.query);

		if (!result.success) {
			return {
				_redirect: '/oauth/error?message=Invalid%20code',
			};
		}

		if (req.query.platform !== 'monzo') {
			return {
				_redirect: '/oauth/error?message=Invalid%20platform',
			};
		}

		const api = await monzoOAuthAPI.exchangeAuthorizationCode(result.data.code);

		const token = createSessionJWT({
			monzo_user_credentials: api.credentials,
		});

		res.setHeader('Set-Cookie', getCookieHeader(token));

		return {
			_redirect: '/monzo/dashboard',
		};
	},
});
