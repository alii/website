import {MonzoAPI, type Id, type Models} from '@otters/monzo';
import {HTTPClientError} from 'alistair/http';
import type {GetServerSideProps, Redirect} from 'next';
import {parseSessionJWT} from '../../../server/sessions';

type Props =
	| {
			success: true;
			data: {
				accounts: Array<
					Models.Account & {
						balance?: Models.Balance;
						pots?: Models.Pot[];
						webhooks?: Array<{
							id: Id<'webhook'>;
							account_id: Models.Account['id'];
							url: string;
						}>;
					}
				>;
			};
	  }
	| {
			success: false;
			error: string;
			body: unknown;
	  };

export default function MonzoDashboard(props: Props) {
	if (!props.success) {
		return (
			<div className="mx-auto my-16 max-w-2xl space-y-8 border border-neutral-800 bg-neutral-900 p-10">
				<p>{props.error}</p>
				<pre>{JSON.stringify(props.body, null, 4)}</pre>
				<p className="text-neutral-400">
					You may need to explicitly enable permissions in the Monzo app, on your phone.
				</p>
			</div>
		);
	}

	const {data} = props;

	return (
		<div className="mx-auto my-16 max-w-2xl space-y-8 border border-neutral-800 bg-neutral-900 p-10">
			<div className="space-y-4">
				<h1 className="text-xl font-bold">Accounts</h1>
				{data.accounts
					.filter(x => !x.closed)
					.map(acct => {
						const formatter = new Intl.NumberFormat(undefined, {
							style: 'currency',
							currency: acct.currency,
							unitDisplay: 'narrow',
							currencyDisplay: 'narrowSymbol',
						});

						const format = (pennies: number) =>
							formatter.format(pennies / 100).replace(/\.00$/, '');

						return (
							<div key={acct.id} className="border border-neutral-800">
								<div className="flex justify-between p-2.5">
									<div className="space-y-0.5">
										<p>
											{acct.owners.map(o => o.preferred_first_name).join(', ')} ({acct.type})
										</p>

										{acct.balance && (
											<p className="text-xl text-neutral-300">
												{format(acct.balance.balance)}{' '}
												{!acct.balance || acct.balance.spend_today === 0 ? null : (
													<span className="text-neutral-400">
														-{format(Math.abs(acct.balance.spend_today))} today
													</span>
												)}
											</p>
										)}
									</div>

									<div className="flex flex-col items-end space-y-1">
										<p className="text-xs text-neutral-500">{acct.description}</p>
										<p className="text-xs text-neutral-500">{acct.id}</p>

										{acct.payment_details && (
											<p className="text-xs text-neutral-500">
												{acct.payment_details.locale_uk.account_number} •{' '}
												{acct.payment_details.locale_uk.sort_code}
											</p>
										)}
									</div>
								</div>

								{acct.pots && acct.pots.length !== 0 && (
									<>
										<hr className="border-neutral-800" />

										<div className="space-y-2 py-2.5">
											<p className="px-2.5">Pots</p>

											<div className="flex w-full space-x-2.5 overflow-x-auto px-2.5">
												{[...acct.pots]
													.filter(x => !x.deleted)
													.map(pot => (
														<div
															key={pot.id}
															className="shrink-0 flex-grow border border-neutral-800 px-3 py-2"
														>
															<p className="text-neutral-200">
																{pot.name}
																{pot.round_up ? (
																	<span className="text-sm text-neutral-400">
																		{' '}
																		({pot.round_up_multiplier}x)
																	</span>
																) : null}
															</p>

															<p className="text-lg">
																{format(pot.balance)}
																{typeof pot.goal_amount !== 'number' ? null : (
																	<span className="text-neutral-400">
																		{' '}
																		/ {format(pot.goal_amount)}
																	</span>
																)}
															</p>
														</div>
													))}
											</div>
										</div>
									</>
								)}

								{acct.webhooks && acct.webhooks.length !== 0 && (
									<>
										<hr className="border-neutral-800" />

										<div className="space-y-2 py-2.5">
											<p className="px-2.5">Webhooks</p>

											<div className="flex w-full space-x-2.5 overflow-x-auto px-2.5">
												{acct.webhooks.map(wehook => (
													<div
														key={wehook.id}
														className="shrink-0 flex-grow border border-neutral-800 px-3 py-2"
													>
														<p className="text-neutral-200">{wehook.url}</p>
														<p className="text-sm text-neutral-400">{wehook.id}</p>
													</div>
												))}
											</div>
										</div>
									</>
								)}
							</div>
						);
					})}
			</div>

			<p className="text-sm text-neutral-500">
				Webhooks are currently misbehaving due to an issue with Monzo's API
			</p>
		</div>
	);
}

const redirect: {redirect: Redirect} = {
	redirect: {
		destination: '/api/oauth/monzo/redirect',
		permanent: false,
	},
};

export const getServerSideProps: GetServerSideProps<Props> = async ({req}) => {
	const {token} = req.cookies;

	if (typeof token !== 'string') {
		return redirect;
	}

	const session = parseSessionJWT(token);

	if (!session || !session.monzo_user_credentials) {
		return redirect;
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
					monzo.getBalance(account.id),
					monzo.listWebhooks(account.id),
					monzo.getPots(account.id),
				]);

				return {
					...account,
					pots,
					balance,
					webhooks,
				};
			}),
		);

		return {
			props: {
				success: true,
				data: {
					accounts: accountsExpanded,
				},
			},
		};
	} catch (e) {
		if (!(e instanceof Error)) {
			return {
				props: {
					success: false,
					error: 'An unknown error occurred',

					// Do this just to make sure Next.js doesn't complain
					// about the body not being serializable.
					body: JSON.parse(JSON.stringify(e)),
				},
			};
		}

		const body = await (e as HTTPClientError).response.json();

		return {
			props: {
				success: false,
				error: e.message,
				body,
			},
		};
	}
};
