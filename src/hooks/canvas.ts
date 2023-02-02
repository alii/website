import {useRef, useState, useEffect, RefObject} from 'react';
import {debounce} from '../utils/timers';

export function useResizingCanvas(): [
	canvasRef: RefObject<HTMLCanvasElement>,
	canvasSize: {
		width: number;
		height: number;
	},
] {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [canvasSize, setCanvasSize] = useState({width: 0, height: 0});

	useEffect(() => {
		const canvas = canvasRef.current;

		if (!canvas) {
			return;
		}

		const resize = () => {
			const {width, height} = canvas.getBoundingClientRect();
			setCanvasSize({width, height});
		};

		const debounced = debounce(resize, 100);

		resize();

		window.addEventListener('resize', debounced);

		return () => {
			window.removeEventListener('resize', debounced);
		};
	}, [canvasRef]);

	return [canvasRef, canvasSize];
}
