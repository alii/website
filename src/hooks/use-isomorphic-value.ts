import {useSyncExternalStore} from 'react';

const noopsub = () => () => {};
export function useIsomorphicValue<T>(client: () => T, server: () => T) {
	return useSyncExternalStore(noopsub, client, server);
}
