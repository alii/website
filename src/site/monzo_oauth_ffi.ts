import {env} from '@/server/env';
import {createSessionJWT} from '@/server/sessions';
import {MonzoAPI, MonzoOAuthAPI} from '@otters/monzo';

const app = new MonzoOAuthAPI({
	client_id: env.MONZO_CLIENT_ID,
	client_secret: env.MONZO_CLIENT_SECRET,
	redirect_uri: `${env.APP_URL}/api/oauth/monzo/callback`,
});

export const url = () => app.getOAuthURL().url;
export const exchange = (code: string) => app.exchangeAuthorizationCode(code);
export const sessionToken = (client: MonzoAPI) =>
	createSessionJWT({monzo_user_credentials: client.credentials});
