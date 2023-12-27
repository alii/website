import {MonzoOAuthAPI, type AppCredentials} from '@otters/monzo';
import {env} from './env';

export const monzoAppCredentials: AppCredentials = {
	client_id: env.MONZO_CLIENT_ID,
	client_secret: env.MONZO_CLIENT_SECRET,
	redirect_uri: `${env.APP_URL}/api/oauth/monzo/callback`,
};

export const monzoOAuthAPI = new MonzoOAuthAPI(monzoAppCredentials);
