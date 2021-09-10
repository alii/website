import {api} from 'nextkit';
import {z} from 'zod';
import {DISCORD_WEBHOOK} from '../../constants';

const schema = z.object({
	email: z.string().email(),
	body: z.string().max(500),
});

export default api({
	async POST(req) {
		const body = schema.parse(req.body);

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

		return {
			sent: true,
		};
	},
});
