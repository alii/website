// Server only: `get_server_side_props` is the only user, and Next drops it
// (and this import) from the browser bundle.
import {parseSessionJWT, type SessionData} from '@/server/sessions';
import {MonzoAPI, type Id, type Models} from '@otters/monzo';
import type {HTTPClientError} from 'alistair/http';
import type {AccountData, Dashboard, Webhook} from '../site/monzo_ffi.ts';

export const parseSession = (token: string) => parseSessionJWT(token);
export const monzoAccessToken = (session: SessionData) =>
	session.monzo_user_credentials?.access_token;
export const monzoClient = (accessToken: string) => new MonzoAPI(accessToken);
export const getAccounts = (client: MonzoAPI) => client.getAccounts();
export const getBalance = (client: MonzoAPI, id: Id<'acc'>) => client.getBalance(id);
export const listWebhooks = (client: MonzoAPI, id: Id<'acc'>) => client.listWebhooks(id);
export const getPots = (client: MonzoAPI, id: Id<'acc'>) => client.getPots(id);

export const withExtras = (
	account: Models.Account,
	balance: Models.Balance | null,
	webhooks: Webhook[] | null,
	pots: Models.Pot[] | null,
): AccountData => ({...account, pots, balance, webhooks});
export const loaded = (accounts: AccountData[]): Dashboard => ({success: true, data: {accounts}});
export const failed = (error: string, body: unknown): Dashboard => ({success: false, error, body});

export const errorMessage = (error: unknown) => (error instanceof Error ? error.message : null);
export const errorResponseJson = (error: unknown): Promise<unknown> =>
	(error as HTTPClientError).response.json();
// so Next never sees something it cannot serialise
export const errorJsonValue = (error: unknown): unknown => JSON.parse(JSON.stringify(error));
