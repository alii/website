import {atom} from 'jotai';

export const initialBackground = 'https://source.unsplash.com/wfh8dDlNFOk/1920x1080';
export const background = atom<string>(initialBackground);
