import {createAPI} from 'nextkit';

export const api = createAPI({
	async onError(req, res, error) {
		console.warn(error);

		return {
			status: 500,
			message: error.message,
		};
	},

	async getContext() {
		return {
			//
		};
	},
});
