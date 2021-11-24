import {NextkitException} from 'nextkit';

export async function fetcher<T>(url: string, init?: RequestInit): Promise<T> {
	const request = await fetch(url, init);
	const json = (await request.json()) as unknown;

	if (request.status >= 400) {
		let message: string;

		if (json && typeof json === 'object' && 'message' in json) {
			// Safe to assert because of the ??= underneath this
			message = (json as {message?: string}).message!;
		}

		message ??= 'Something went wrong';

		throw new NextkitException(request.status, message);
	}

	return json as T;
}
