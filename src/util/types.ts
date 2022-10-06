import type {Join, Utility} from 'typestr';

export function rand(exclusiveMin: number, inclusiveMax: number): number;
export function rand<T>(arr: T[]): T;
export function rand<T>(arr: T[] | number, b?: number): T | number {
	if (typeof arr === 'number') {
		if (!b) {
			throw new Error('Invalid arguments');
		}

		return Math.floor(Math.random() * (b - arr + 1)) + arr;
	}

	return arr[Math.floor(Math.random() * arr.length)];
}

export function join<T extends readonly string[], R extends string>(
	arr: T,
	r: R,
) {
	return arr.join(r) as Join<Utility.Writable<T>, R>;
}
