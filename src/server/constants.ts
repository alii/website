// Generic in case NodeJS.ProcessEnv is ever extended in the future
function env<Key extends keyof NodeJS.ProcessEnv>(key: Key) {
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

// Whilst I use upstash, I didn't want anybody else
// using this to be locked into using upstash.
// So you can use any redis server here - just remember
// that you can't use it serverlessly! I only use it inside
// of revalidations and at build time (no risk of breaking)
export const REDIS_URL = env('REDIS_URL');

// This is local and not an environment variable because I just connect to
// the production redis instance.
export const SPOTIFY_REDIRECT_URI = 'http://localhost:3000/api/spotify/oauth';

export const SPOTIFY_REDIS_KEYS = {
	AccessToken: 'spotify:access_token',
	RefreshToken: 'spotify:refresh_token',
};
