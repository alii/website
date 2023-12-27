import {validateId, type Id} from '@otters/monzo';
import {z} from 'zod';

export const env = z
	.object({
		APPLE_TEAM_ID: z.string(),
		APPLE_KEY_ID: z.string(),
		APPLE_PRIV_KEY: z.string(),
		DISCORD_WEBHOOK: z.string().url(),
		TURNSTILE_SECRET_KEY: z.string(),
		VERCEL_URL: z
			.string()
			.default('localhost:3000')
			.transform(value => {
				if (value === 'localhost:3000') {
					return 'http://localhost:3000';
				}

				return `https://${value}`;
			})
			.pipe(z.string().url()),
		DEFAULT_LOCATION: z.string().default('London'),
		MONZO_CLIENT_ID: z
			.string()
			.refine((id): id is Id<'oauth2client'> => validateId(id, 'oauth2client')),
		MONZO_CLIENT_SECRET: z.string(),
		JWT_SIGNING_SECRET: z.string(),
	})
	.transform(result => {
		const {VERCEL_URL, ...rest} = result;

		return {
			APP_URL: VERCEL_URL,
			...rest,
		};
	})
	.parse(process.env);
