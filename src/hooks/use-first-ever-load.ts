import {useLocalStorage} from 'alistair/hooks';
import {useRouter} from 'next/router';

export function useFirstEverLoad() {
	const router = useRouter();

	return useLocalStorage('user:first-ever-load', () => ({
		path: router.pathname,
		time: Date.now(),
		query: router.query,
	}));
}

export function useVisitCounts() {
	return useLocalStorage('user:visit-counts', () => 1);
}
