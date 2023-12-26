import {serialize} from 'cookie';
import dayjs from 'dayjs';
import {sign, verify} from 'jsonwebtoken';
import {env} from './env';

export interface SessionData {
	monzo_user_credentials?:
		| {
				access_token: string;
				refresh_token: string;
				token_type: string;
		  }
		| {
				token_type: string;
				access_token: string;
		  };
}

export function createSessionJWT(data: SessionData) {
	return sign(data, env.JWT_SIGNING_SECRET, {
		expiresIn: '1d',
	});
}

export function parseSessionJWT(token: string): SessionData | null {
	try {
		const result = verify(token, env.JWT_SIGNING_SECRET);

		if (typeof result === 'string') {
			return null;
		}

		return result as SessionData;
	} catch {
		return null;
	}
}

export function getCookieHeader(token: string) {
	return serialize('token', token, {
		httpOnly: true,
		path: '/',
		secure: process.env.NODE_ENV !== 'development',
		expires: dayjs().add(1, 'day').toDate(),
		sameSite: 'strict',
	});
}
