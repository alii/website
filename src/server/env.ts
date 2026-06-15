import {validateId, type Id} from '@otters/monzo';
import {z} from 'zod';

export const env = z
	.object({
		APPLE_TEAM_ID: z.string(),
		APPLE_KEY_ID: z.string(),
		APPLE_PRIV_KEY: z.string(),
		DISCORD_WEBHOOK: z.string().url(),
		TURNSTILE_SECRET_KEY: z.string(),
		APP_URL: z.string().default('http://localhost:3000').pipe(z.string().url()),
		DEFAULT_LOCATION: z.string().default('London'),
		MONZO_CLIENT_ID: z
			.string()
			.refine((id): id is Id<'oauth2client'> => validateId(id, 'oauth2client')),
		MONZO_CLIENT_SECRET: z.string(),
		JWT_SIGNING_SECRET: z.string(),

		DISCORD_DEMO_JWT_SECRET: z.string(),
		DISCORD_DEMO_REDIRECT_URI: z.string().url(),
		DISCORD_DEMO_DISCORD_CLIENT_ID: z.string(),
		DISCORD_DEMO_DISCORD_CLIENT_SECRET: z.string(),

		// Lanyard API key, used to persist blog post votes into Lanyard KV.
		// Optional: if unset, /api/vote returns 503 and the UI degrades to
		// read-only counts. Get one with `.apikey` in the Lanyard Discord
		// (https://discord.gg/lanyard).
		LANYARD_API_KEY: z.string().optional(),
	})
	.parse(process.env);
