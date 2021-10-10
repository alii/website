import {api} from 'nextkit';
import {z} from 'zod';
import {DISCORD_WEBHOOK} from '../../constants';

const schema = z.object({
	email: z.string().email(),
	body: z.string().max(500),
	is_json: z.boolean().optional(),
});

export default api({
	async POST(request) {
		const {is_json = false, ...body} = schema.parse(request.body);

		await fetch(DISCORD_WEBHOOK, {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				content: 'new email innit',
				embeds: [
					{
						description: body.body,
						author: {
							name: body.email,
						},
					},
				],
			}),
		});

		if (is_json) {
			return {
				sent: true,
			};
		}

		return {
			_redirect: '/thanks',
		};
	},
});
