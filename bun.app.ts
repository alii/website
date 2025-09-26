import react from 'bun-framework-react';

const bundlerOptions = {
	minify: {
		whitespace: false,
		syntax: false,
		identifiers: false,
	},
};
export default {
	app: {
		framework: {
			...react,
			bundlerOptions: {
				...bundlerOptions,
				...react.bundlerOptions,
			},
		},
		bundlerOptions: {
			server: bundlerOptions,
			client: bundlerOptions,
			ssr: bundlerOptions,
		},
	},
};
