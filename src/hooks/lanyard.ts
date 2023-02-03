import {Data, Snowflake, useLanyard} from 'use-lanyard';
import {useInterval} from './timers';

export function useUpdatingLanyard(id: Snowflake, initialData: Data) {
	const state = useLanyard(id, {
		initialData,
	});

	useInterval(5000, {
		callback: state.revalidate,
		deps: [],
	});

	return {
		...state,
		data: state.data!,
	};
}
