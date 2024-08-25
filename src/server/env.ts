import {z} from 'zod';

export const env = z
    .object({
        APP_URL: z.string().default('http://localhost:3000').pipe(z.string().url()),
        JWT_SIGNING_SECRET: z.string(),
        DEFAULT_LOCATION: z.string().default('Toronto'),
    })
    .parse(process.env);