import { atom } from 'jotai';

export const initialBackground = `https://source.unsplash.com/rpVQJbZMw8o/${window.innerWidth}x${window.innerHeight}`;
export const background = atom<string>(initialBackground);

export const modalOpen = atom<boolean>(false);
