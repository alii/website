import type {Id, Models} from '@otters/monzo';
import {Error as GleamError, Ok, toList, type Result} from '@gleam/prelude.mjs';
import {
	Account,
	Balance,
	Failure,
	PaymentDetails,
	Pot,
	Webhook,
	type Account$,
	type Failure$,
} from '@gleam/website/site/monzo.mjs';
import {toOption} from '../js_ffi.ts';

export type AccountData = Models.Account & {
	balance?: Models.Balance | null;
	pots?: Models.Pot[] | null;
	webhooks?: Array<{id: Id<'webhook'>; account_id: Models.Account['id']; url: string}> | null;
};

/** The page's props: what `getServerSideProps` returns and Next serialises. */
export type Dashboard =
	{success: true; data: {accounts: AccountData[]}} | {success: false; error: string; body: unknown};

export function accounts(dashboard: Dashboard): Result<Account$[], Failure$> {
	if (!dashboard.success) {
		return new GleamError(
			new Failure(dashboard.error, JSON.stringify(dashboard.body, null, 4) ?? ''),
		);
	}
	return new Ok(toList(dashboard.data.accounts.map(account)));
}

const account = (acct: AccountData) =>
	new Account(
		acct.id,
		acct.type,
		acct.description,
		acct.closed,
		acct.currency,
		toList(acct.owners.map(owner => owner.preferred_first_name)),
		toOption(acct.balance && new Balance(acct.balance.balance, acct.balance.spend_today)),
		toOption(acct.pots && toList(acct.pots.map(pot))),
		toOption(acct.webhooks && toList(acct.webhooks.map(hook => new Webhook(hook.id, hook.url)))),
		toOption(
			acct.payment_details &&
				new PaymentDetails(
					acct.payment_details.locale_uk.account_number,
					acct.payment_details.locale_uk.sort_code,
				),
		),
	);

const pot = (pot: Models.Pot) =>
	new Pot(
		pot.id,
		pot.name,
		pot.deleted,
		toOption(pot.round_up ? String(pot.round_up_multiplier) : null),
		pot.balance,
		toOption(typeof pot.goal_amount === 'number' ? pot.goal_amount : null),
	);

export function format(currency: string, pennies: number) {
	const formatter = new Intl.NumberFormat(undefined, {
		style: 'currency',
		currency,
		unitDisplay: 'narrow',
		currencyDisplay: 'narrowSymbol',
	});
	return formatter.format(pennies / 100).replace(/\.00$/, '');
}
