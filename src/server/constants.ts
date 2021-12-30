function env(key: string) {
	const value = process.env[key];

	if (!value) {
		throw new Error(`Missing environment variable ${key}`);
	}

	return value;
}

export const DISCORD_WEBHOOK = env('DISCORD_WEBHOOK');
export const LAST_FM_API_KEY = env('LAST_FM_API_KEY');
export const SPOTIFY_CLIENT_ID = env('SPOTIFY_CLIENT_ID');
export const SPOTIFY_CLIENT_SECRET = env('SPOTIFY_CLIENT_SECRET');
export const SPOTIFY_REDIRECT_URI = 'http://localhost:3000/api/spotify/oauth';
export const REDIS_URL = env('REDIS_URL');

export const SPOTIFY_REDIS_KEYS = {
	AccessToken: 'spotify:access_token',
	RefreshToken: 'spotify:refresh_token',
};
