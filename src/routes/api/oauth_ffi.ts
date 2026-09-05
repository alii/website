import {env} from '@/server/env';
import {sign as signJwt} from 'jsonwebtoken';

export const sign = (user: object) =>
	signJwt(user, env.DISCORD_DEMO_JWT_SECRET, {expiresIn: '24h'});
