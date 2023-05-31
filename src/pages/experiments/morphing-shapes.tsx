import {useEffect, useState} from 'react';
import {v4 as uuid} from 'uuid';

const THEME_COLORS = ['#fc9494', '#94e4fc', '#bffc94', '#ffffff'];
const randomColor = () => THEME_COLORS[Math.floor(Math.random() * THEME_COLORS.length)]!;
const ELEMENT_COUNT = 4;

const IS_BROWSER = typeof window !== 'undefined';

const LIMITS = {
	TOP: IS_BROWSER ? window.innerHeight - 50 : 750,
	LEFT: IS_BROWSER ? window.innerWidth - 50 : 550,
	SCALE: 2,
};

const randomNumber = (scale: number) => Math.ceil(Math.random() * scale);

interface BoxState {
	top: number;
	left: number;
	scale: number;
	rotation: number;
	borderRadius: string;
	background: string;
	clipped: boolean;
}

function generateNewState(oldState: Partial<BoxState>): BoxState {
	const random = Math.random() > 0.5;

	return {
		...oldState,
		rotation: randomNumber(360),
		top: Math.ceil(Math.random() * LIMITS.TOP),
		left: Math.ceil(Math.random() * LIMITS.LEFT),
		scale: Math.ceil(Math.random() * LIMITS.SCALE),

		borderRadius: random ? '0px' : Math.random() > 0.5 ? '50%' : '3px',
		background: random ? '#595959' : randomColor(),

		clipped: random,
	};
}

function Box() {
	const delay = 3 * Math.random() + 0.5;

	const [state, setState] = useState(() => generateNewState({}));

	useEffect(() => {
		const timer = setTimeout(() => setState(old => generateNewState(old)), delay * 1000);

		return () => clearTimeout(timer);
	}, [delay]);

	useEffect(() => setState(old => generateNewState(old)), []);

	const {top, left, scale, rotation, borderRadius, background, clipped} = state;

	return (
		<div
			style={{
				position: 'fixed',
				top,
				left,
				borderRadius,
				background,
				height: '50px',
				width: '50px',
				transform: `scale(${scale}) rotate(${rotation}deg)`,
				transition: `all ${delay}s cubic-bezier(1, 0.1, 0, 0.9)`,
				zIndex: -1,

				clipPath: clipped ? 'polygon(50% 0, 50% 0, 100% 100%, 0% 100%)' : 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)',
			}}
		/>
	);
}

const boxes = [...new Array(ELEMENT_COUNT)].map(() => <Box key={uuid()} />);

export default function MorphingShapes() {
	return <>{boxes}</>;
}
