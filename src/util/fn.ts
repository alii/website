export type CB<T, R> = (item: T, index: number, arr: T[]) => R;
export type MapFn<T, R> = (arr: T[]) => R[];

export function mapper<T, R>(callback: CB<T, R>) {
	return (arr: T[]) => arr.map(callback);
}
