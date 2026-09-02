// Server only: this page's `get_server_side_props` is the only user, and Next
// drops it (and this import) from the browser bundle.
import {env} from '@/server/env';
import type {APIUser} from 'discord-api-types/v10';
import {verify as verifyJwt} from 'jsonwebtoken';

export const verify = (token: string) => verifyJwt(token, env.DISCORD_DEMO_JWT_SECRET) as APIUser;
