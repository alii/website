/**
 * Safe way to wrap async functions to handle errors at a higher level
 * @param fn
 * @param err
 */
export function throws<R, E, S, A extends unknown[] = []>(
	fn: (...args: A) => Promise<R>,
	err: (err: E) => Promise<S>,
) {
	return async (...args: A) => {
		try {
			return await fn(...args);
		} catch (e: unknown) {
			return err(e as E);
		}
	};
}
