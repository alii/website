import {envsafe, str} from 'envsafe';

export const env = envsafe({
	APPLE_TEAM_ID: str(),
	APPLE_KEY_ID: str(),
	APPLE_PRIV_KEY: str(),
});
