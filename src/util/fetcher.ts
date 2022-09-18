import {hasProp, type NextkitError} from 'nextkit';
import {throws} from './exceptions';

export class FetcherError extends Error implements NextkitError {
	constructor(public readonly code: number, message: string) {
		super(message);
	}
}

export async function fetcher<T>(url: string, init?: RequestInit): Promise<T> {
	const response = await fetch(url, init);
	const json = (await response.json()) as unknown;

	if (response.status >= 400) {
		let message = 'Something went wrong';

		if (hasProp(json, 'message') && typeof json.message === 'string') {
			message = json.message;
		}

		throw new FetcherError(response.status, message);
	}

	return json as T;
}

export const safeFetcher = throws(fetcher, async () => null);
