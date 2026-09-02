// Server only: `get_server_side_props` is the only user, and Next drops it
// (and this import) from the browser bundle.
import {parseSessionJWT, type SessionData} from '@/server/sessions';
import {MonzoAPI, type Id} from '@otters/monzo';
import type {HTTPClientError} from 'alistair/http';

export const parseSession = (token: string) => parseSessionJWT(token);
export const monzoAccessToken = (session: SessionData) =>
	session.monzo_user_credentials?.access_token;
export const monzoClient = (accessToken: string) => new MonzoAPI(accessToken);
export const getAccounts = (client: MonzoAPI) => client.getAccounts();
export const getBalance = (client: MonzoAPI, id: Id<'acc'>) => client.getBalance(id);
export const listWebhooks = (client: MonzoAPI, id: Id<'acc'>) => client.listWebhooks(id);
export const getPots = (client: MonzoAPI, id: Id<'acc'>) => client.getPots(id);
export const errorMessage = (error: unknown) => (error instanceof Error ? error.message : null);
export const errorResponseJson = (error: unknown) => (error as HTTPClientError).response.json();
// so Next never sees something it cannot serialise
export const errorJsonValue = (error: unknown): unknown => JSON.parse(JSON.stringify(error));
