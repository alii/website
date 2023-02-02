import {envsafe, str, url} from 'envsafe';

export const env = envsafe({
	APPLE_TEAM_ID: str(),
	APPLE_KEY_ID: str(),
	APPLE_PRIV_KEY: str(),
	DISCORD_WEBHOOK: url(),
	TURNSTILE_SECRET_KEY: str(),
	DEFAULT_LOCATION: str({
		default: 'London, UK',
	}),
});
