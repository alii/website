import {z} from 'zod';
import {api} from '../../../../server/api';

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

		// Handle other OAuth platforms here if needed

		return {
			_redirect: '/oauth/error?message=Invalid%20platform',
		};
	},
});