import IORedis from 'ioredis';
import SpotifyWebApi from 'spotify-web-api-node';
import urlcat from 'urlcat';
import {z} from 'zod';
import {api} from '../../../server/api';
import {
	REDIS_URL,
	SPOTIFY_CLIENT_ID,
	SPOTIFY_CLIENT_SECRET,
	SPOTIFY_REDIRECT_URI,
	SPOTIFY_REDIS_KEYS,
} from '../../../server/constants';
import {join} from '../../../util/types';

const scopes = [
	'user-top-read',
	'user-read-private',
	'user-read-email',
] as const;

const scope = join(scopes, ' ');

const redirectUrl = urlcat('https://accounts.spotify.com/authorize', {
	response_type: 'code',
	client_id: SPOTIFY_CLIENT_ID,
	scope,
	redirect_uri: SPOTIFY_REDIRECT_URI,
});

const schema = z.object({
	code: z.string().optional(),
});

export default api({
	async GET({req, res}) {
		const {code} = schema.parse(req.query);

		if (!code) {
			return {
				_redirect: redirectUrl,
			};
		}

		const api = new SpotifyWebApi({
			clientId: SPOTIFY_CLIENT_ID,
			clientSecret: SPOTIFY_CLIENT_SECRET,
			redirectUri: SPOTIFY_REDIRECT_URI,
		});

		const {body: auth} = await api.authorizationCodeGrant(code);

		const userAPI = new SpotifyWebApi({
			accessToken: auth.access_token,
			refreshToken: auth.refresh_token,
		});

		const {body: user} = await userAPI.getMe();

		if (user.id !== 'alistairsmith01') {
			res.throw(403, 'You are not permitted to update OAuth keys!');
		}

		const redis = new IORedis(REDIS_URL);

		await redis.set(
			SPOTIFY_REDIS_KEYS.AccessToken,
			auth.access_token,
			'EX',
			auth.expires_in,
		);

		await redis.set(SPOTIFY_REDIS_KEYS.RefreshToken, auth.refresh_token);
		await redis.quit();

		return user;
	},
});
