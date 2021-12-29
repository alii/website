function env(key: string) {
	const value = process.env[key];

	if (!value) {
		throw new Error(`Missing environment variable ${key}`);
	}

	return value;
}

export const DISCORD_WEBHOOK = env('DISCORD_WEBHOOK');
export const SPOTIFY_CLIENT_ID = env('SPOTIFY_CLIENT_ID');
export const SPOTIFY_CLIENT_SECRET = env('SPOTIFY_CLIENT_SECRET');
export const SPOTIFY_ACCESS_TOKEN = env('SPOTIFY_ACCESS_TOKEN');
