import type {NativeTimeout} from './types';

export function debounce<A extends unknown[] = []>(func: (...args: A) => void, ms: number) {
	let timeout: NativeTimeout | null = null;

	const debounced = (...args: A) => {
		if (timeout !== null) {
			clearTimeout(timeout);
		}

		timeout = setTimeout(() => func(...args), ms);
	};

	return debounced;
}
