import {createAPI} from 'nextkit';
import {discordId} from '../utils/constants';
import {getLanyard} from './lanyard';

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
			lanyard: {
				get: async () => getLanyard(discordId),
			},
		};
	},
});
