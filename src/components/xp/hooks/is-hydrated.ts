import {useSyncExternalStore} from 'react';

const noopsub = () => () => {};

export function useIsHydrated() {
	return useSyncExternalStore(
		noopsub,
		() => true,
		() => false,
	);
}
