export const jsonParseCache = new Map<string, unknown>();

export function memoJsonParse<T>(value: string): T;
export function memoJsonParse<T>(value: string | null): T | null;
export function memoJsonParse<T>(value: string | null) {
	if (value === null) return null as T;
	const cached = jsonParseCache.get(value);
	if (cached) return cached as T;
	const parsed = JSON.parse(value) as T;
	jsonParseCache.set(value, parsed);
	return parsed;
}
