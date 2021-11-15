import {createAPIWithHandledErrors} from 'nextkit';

export const api = createAPIWithHandledErrors((req, res, err) => {
	console.warn(err);

	res.json({
		success: false,
		data: null,
		message: 'Bruh',
	});
});
