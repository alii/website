// Serves the Gleam API routes (`handle(request)` in src/routes/api) from `app/server.ts`. The FFI of
// src/api.gleam and src/next/runtime.gleam reads a request and writes a response through the few
// members of Next's `req` and `res` it used; `ApiRequest` and `ApiResponse` are those, on top of a
// web `Request` and `Response`.

export interface ApiRequest {
	method: string;
	query: Record<string, string>;
	headers: Record<string, string>;
	socket: {remoteAddress: string | undefined};
	body: unknown;
}

export interface ApiResponse {
	status(code: number): ApiResponse;
	setHeader(name: string, value: string): void;
	end(body: string): void;
	redirect(to: string): void;
}

type Handler = (request: ApiRequest, response: ApiResponse) => Promise<unknown>;

/** A `Bun.serve()` route for the default export of a compiled Gleam API route. */
export function apiRoute(handler: Handler) {
	return async (request: Request & {params?: Record<string, string>}, server: Bun.Server<unknown>) => {
		const url = new URL(request.url);
		const text = await request.text();
		let body: unknown = text;
		if (request.headers.get('content-type')?.includes('application/json')) {
			try {
				body = JSON.parse(text);
			} catch {
				body = undefined;
			}
		}
		const apiRequest: ApiRequest = {
			method: request.method,
			// As in Next, the route's parameters are part of the query.
			query: {...Object.fromEntries(url.searchParams), ...request.params},
			headers: Object.fromEntries(request.headers),
			socket: {remoteAddress: server.requestIP(request)?.address},
			body,
		};

		let status = 200;
		const headers = new Headers();
		const {promise, resolve} = Promise.withResolvers<Response>();
		const apiResponse: ApiResponse = {
			status(code) {
				status = code;
				return apiResponse;
			},
			setHeader(name, value) {
				headers.set(name, value);
			},
			end(body) {
				resolve(new Response(body, {status, headers}));
			},
			redirect(to) {
				headers.set('location', to);
				resolve(new Response(null, {status: 307, headers}));
			},
		};

		await handler(apiRequest, apiResponse);
		return promise;
	};
}
