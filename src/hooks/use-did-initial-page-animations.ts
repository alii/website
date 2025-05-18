import {useEffect} from 'react';

const store = {did: false};

export function useShouldDoInitialPageAnimations() {
	useEffect(() => {
		store.did = true;
	}, []);

	return !store.did;
}
