import type {Join, Utility} from 'typestr';

export function rand<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

export function join<T extends readonly string[], R extends string>(
	arr: T,
	r: R,
) {
	return arr.join(r) as Join<Utility.Writable<T>, R>;
}
