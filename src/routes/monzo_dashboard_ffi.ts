// Server only: `get_server_side_props` is the only user, and Next drops it
// (and this import) from the browser bundle.
import {parseSessionJWT} from '@/server/sessions';
import {Error as GleamError, Ok, type Result} from '@gleam/prelude.mjs';
import {MonzoAPI} from '@otters/monzo';
import {HTTPClientError} from 'alistair/http';
import type {Dashboard} from '../site/monzo_ffi.ts';

export async function load(token: string): Promise<Result<Dashboard, undefined>> {
	const session = parseSessionJWT(token);

	if (!session || !session.monzo_user_credentials) {
		return new GleamError(undefined);
	}

	const monzo = new MonzoAPI(session.monzo_user_credentials.access_token);

	try {
		const accounts = await monzo.getAccounts();
		const accountsExpanded = await Promise.all(
			accounts.map(async account => {
				if (account.closed) {
					return account;
				}

				const [balance, webhooks, pots] = await Promise.all([
					monzo.getBalance(account.id).catch(() => null),
					monzo.listWebhooks(account.id).catch(() => null),
					monzo.getPots(account.id).catch(() => null),
				]);

				return {...account, pots, balance, webhooks};
			}),
		);

		return new Ok({success: true, data: {accounts: accountsExpanded}});
	} catch (e) {
		if (!(e instanceof Error)) {
			return new Ok({
				success: false,
				error: 'An unknown error occurred',
				// Do this just to make sure Next.js doesn't complain
				// about the body not being serializable.
				body: JSON.parse(JSON.stringify(e)),
			});
		}

		const body = await (e as HTTPClientError).response.json();

		return new Ok({success: false, error: e.message, body});
	}
}
