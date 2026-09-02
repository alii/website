import type {Id, Models} from '@otters/monzo';

export type AccountData = Models.Account & {
	balance?: Models.Balance | null;
	pots?: Models.Pot[] | null;
	webhooks?: Array<{id: Id<'webhook'>; account_id: Models.Account['id']; url: string}> | null;
};

/** The page's props: what `getServerSideProps` returns and Next serialises. */
export type Dashboard =
	{success: true; data: {accounts: AccountData[]}} | {success: false; error: string; body: unknown};

type Owner = Models.Account['owners'][number];
type PaymentDetails = NonNullable<Models.Account['payment_details']>;
export type Webhook = NonNullable<AccountData['webhooks']>[number];

export const success = (dashboard: Dashboard) => (dashboard.success ? dashboard : null);
export const failure = (dashboard: Dashboard) => (dashboard.success ? null : dashboard);
export const accounts = (success: Extract<Dashboard, {success: true}>) => success.data.accounts;
export const error = (failure: Extract<Dashboard, {success: false}>) => failure.error;
export const body = (failure: Extract<Dashboard, {success: false}>) => failure.body;

export const id = (account: AccountData) => account.id;
export const kind = (account: AccountData) => account.type;
export const description = (account: AccountData) => account.description;
export const closed = (account: AccountData) => account.closed;
export const currency = (account: AccountData) => account.currency;
export const owners = (account: AccountData) => account.owners;
export const preferredFirstName = (owner: Owner) => owner.preferred_first_name;
export const balance = (account: AccountData) => account.balance;
export const pots = (account: AccountData) => account.pots;
export const webhooks = (account: AccountData) => account.webhooks;
export const paymentDetails = (account: AccountData) => account.payment_details;

export const balanceAmount = (balance: Models.Balance) => balance.balance;
export const spendToday = (balance: Models.Balance) => balance.spend_today;

export const potId = (pot: Models.Pot) => pot.id;
export const potName = (pot: Models.Pot) => pot.name;
export const potDeleted = (pot: Models.Pot) => pot.deleted;
export const potRoundUp = (pot: Models.Pot) => pot.round_up;
export const potRoundUpMultiplier = (pot: Models.Pot) => pot.round_up_multiplier;
export const potBalance = (pot: Models.Pot) => pot.balance;
export const potGoalAmount = (pot: Models.Pot) => pot.goal_amount;

export const webhookId = (webhook: Webhook) => webhook.id;
export const webhookUrl = (webhook: Webhook) => webhook.url;

export const accountNumber = (details: PaymentDetails) => details.locale_uk.account_number;
export const sortCode = (details: PaymentDetails) => details.locale_uk.sort_code;

export const formatCurrency = (currency: string, amount: number) =>
	new Intl.NumberFormat(undefined, {
		style: 'currency',
		currency,
		unitDisplay: 'narrow',
		currencyDisplay: 'narrowSymbol',
	}).format(amount);
