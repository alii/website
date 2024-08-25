import {z} from 'zod';
import {api} from '../../../../server/api';

const urlSchema = z
	.object({
		platform: z.string(),
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

		// Handle other OAuth platforms here if needed

		return {
			_redirect: '/oauth/error?message=Invalid%20platform',
		};
	},
});