function env(key: string) {
	const value = process.env[key];

	if (!value) {
		throw new Error(`Missing environment variable ${key}`);
	}

	return value;
}

export const DISCORD_WEBHOOK = env('DISCORD_WEBHOOK');
export const LAST_FM_API_KEY = env('LAST_FM_API_KEY');
export const LAST_FM_USERNAME = 'aabbccsmith';
