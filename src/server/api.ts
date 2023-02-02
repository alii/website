import {createAPI} from 'nextkit';
import {env} from './env';

export const api = createAPI({
	async onError(_req, _res, error) {
		console.warn(error);

		return {
			status: 500,
			message: error.message,
		};
	},

	async getContext() {
		return {
			async turnstile(token: string, ip: string | null) {
				const formData = new URLSearchParams();

				formData.append('secret', env.TURNSTILE_SECRET_KEY);
				formData.append('response', token);

				if (ip) {
					formData.append('remoteip', ip);
				}

				const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

				const result = await fetch(url, {
					body: formData,
					method: 'POST',
				});

				return (await result.json()) as
					| {
							'success': true;
							'challenge_ts': string;
							'hostname': string;
							'error-codes': string[];
							'action': string;
							'cdata': string;
					  }
					| {
							'success': false;
							'error-codes': [string, ...string[]];
					  };
			},
		};
	},
});
