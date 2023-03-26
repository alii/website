import {type DependencyList, useEffect} from 'react';

export function useInterval(ms: number, options: {callback: () => void; deps: DependencyList}) {
	useEffect(() => {
		const id = setInterval(options.callback, ms);

		return () => {
			clearInterval(id);
		};

		// Safe to ignore, because the caller is responsible for passing
		// valid dependencies.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ms, ...options.deps]);
}
