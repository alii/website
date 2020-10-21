import { atom } from 'jotai';

export const initialBackground = `https://source.unsplash.com/ciO5L8pin8A/${window.innerWidth}x${window.innerHeight}`;
export const background = atom<string>(initialBackground);

export const modalOpen = atom<boolean>(true);
