import {MotionValue, useTransform} from 'framer-motion';
import {useRef} from 'react';

export function useLerpTransform<I extends number>(value: MotionValue<I>) {
	const prev = useRef<I | null>(null);

	return useTransform(value, newValue => {
		const prevValue = prev.current ?? newValue;
		const lerpValue = prevValue + (newValue - prevValue) * 10;

		prev.current = newValue;

		return lerpValue;
	});
}
