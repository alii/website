import {createAPI} from 'nextkit';

export const api = createAPI({
	onError: async (req, res, error) => {
		console.warn(error);

		return {
			status: 500,
			message: error.message,
		};
	},
});
