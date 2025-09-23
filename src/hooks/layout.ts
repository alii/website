import {useLayoutEffect} from 'react';

export const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : () => {};
