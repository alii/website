import {useEffect} from 'react';

const store = {did: false};

// This is basically a "did already mount some pages" flag
// which means that if a user is going back and forth between
// pages, we don't want to do the initial page animations
// because it makes them wait unnecessarily
export function useShouldDoInitialPageAnimations() {
	useEffect(() => {
		store.did = true;
	}, []);

	return !store.did;
}
