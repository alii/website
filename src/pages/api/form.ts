import {api} from '../../server/api';
import {z} from 'zod';
import {DISCORD_WEBHOOK} from '../../constants';
import {HttpException} from 'nextkit';

const schema = z.object({
	email: z.string().email(),
	body: z.string().max(500).min(3),
	is_json: z.boolean().optional(),
});

export default api({
	async POST(request) {
		const {is_json = false, ...body} = schema.parse(request.body);

		const result = await fetch(DISCORD_WEBHOOK, {
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
						fields: [
							{
								name: 'ip',
								value:
									request.headers['x-forwarded-for'] ??
									request.connection.remoteAddress ??
									'unknown!?',
							},
						],
					},
				],
			}),
		});

		if (result.status >= 400) {
			throw new HttpException(result.status, 'Error sending notification');
		}

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
