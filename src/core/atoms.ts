import { atom } from 'jotai';

export const initialBackground = 'https://source.unsplash.com/UAFXj9dRpwo/1920x1080';
export const background = atom<string>(initialBackground);

export const modalOpen = atom<boolean>(false);
