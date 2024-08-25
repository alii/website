import {z} from 'zod';

export const env = z
    .object({
        APP_URL: z.string().default('http://localhost:3000').pipe(z.string().url()),
        JWT_SIGNING_SECRET: z.string(),
        // DISCORD_WEBHOOK: z.string().url(),
        // TURNSTILE_SECRET_KEY: z.string(),
        DEFAULT_LOCATION: z.string().default('Toronto'),
        // MONZO_CLIENT_ID: z
        //     .string()
        //     .refine((id): id is Id<'oauth2client'> => validateId(id, 'oauth2client')),
        // MONZO_CLIENT_SECRET: z.string(),
    })
    .parse(process.env);