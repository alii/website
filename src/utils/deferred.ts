export function deferred<T, Reject = Error>() {
	let resolve: (value: T) => void;
	let reject: (reason: Reject) => void;

	let status: 'pending' | 'resolved' | 'rejected' = 'pending';

	const promise = new Promise<T>((res, rej) => {
		resolve = value => {
			status = 'resolved';
			res(value);
		};

		reject = value => {
			status = 'rejected';
			rej(value);
		};
	});

	return {
		then: async <Result1, Result2 = never>(
			onResolved: (value: T) => Result1 | PromiseLike<Result1>,
			onRejected?: (reason: Reject) => Result2 | PromiseLike<Result2>,
		) => promise.then(onResolved, onRejected),

		catch: async <Result>(onRejected: (value: T) => PromiseLike<Result>) =>
			promise.catch(onRejected),

		resolve: resolve!,
		reject: reject!,
		get status() {
			return status;
		},
	};
}
