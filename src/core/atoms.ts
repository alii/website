import { atom } from 'jotai';

export const initialBackground = `https://source.unsplash.com/UAFXj9dRpwo/${window.innerWidth}x${window.innerHeight}`;
export const background = atom<string>(initialBackground);

export const modalOpen = atom<boolean>(false);
