import {bwitch} from 'bwitch';
import {NextkitError} from 'nextkit';
import {z} from 'zod';
import {api} from '../../server/api';
import {env} from '../../server/env';
import {codeblock} from '../../utils/discord';

const schema = z.object({
	email: z.string().email(),
	body: z.string().max(500).min(10),
	turnstile: z.string(),
});

export default api({
	async POST({req, ctx}) {
		const body = schema.parse(req.body);

		const ip = (req.headers['x-forwarded-for'] as string) ?? req.socket.remoteAddress ?? null;

		const outcome = await ctx.turnstile(body.turnstile, ip);

		if (!outcome.success) {
			throw new NextkitError(400, 'Invalid turnstile token, robot!');
		}

		const result = await fetch(env.DISCORD_WEBHOOK, {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				content: 'contact form submission',
				embeds: [
					{
						description: body.body,
						author: {name: body.email},
						fields: [{name: 'ip', value: ip ?? 'unknown!?'}],
					},

					{
						title: 'turnstile',
						description: codeblock(JSON.stringify(outcome, null, 2), 'json'),
					},
				],
			}),
		});

		if (result.status >= 400) {
			throw new NextkitError(result.status, 'Error sending notification');
		}

		return bwitch(req.headers['content-type'])
			.case('application/json', () => ({sent: true}))
			.or(() => ({_redirect: '/thanks'}));
	},
});
