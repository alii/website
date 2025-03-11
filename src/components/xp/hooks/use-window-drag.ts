import {useEvent} from 'alistair/hooks';
import {useEffect, useId, useRef, useState, useSyncExternalStore} from 'react';
import {memoJsonParse} from '../../../lib/json';
import type {Position} from '../types';

interface UseWindowDragReturn {
	isMouseDown: boolean;
	ready: boolean;
	handleMouseDown: (e: React.MouseEvent) => void;
}

export function useWindowDrag(el: HTMLElement | null): UseWindowDragReturn {
	const id = useId();

	const initialPosition = useSyncExternalStore(
		() => () => {},
		() => memoJsonParse<Position>(window.localStorage.getItem(`window-position-${id}`)),
		() => null,
	);

	useEffect(() => {
		if (!initialPosition || !el) {
			return;
		}

		el.style.transform = `translate(${initialPosition.x}px, ${initialPosition.y}px)`;
	}, [initialPosition, el]);

	const updatePosition = useEvent((position: Position) => {
		if (!el) return;
		window.localStorage.setItem(`window-position-${id}`, JSON.stringify(position));
		el.style.transform = `translate(${position.x}px, ${position.y}px)`;
	});

	const [isMouseDown, setIsMouseDown] = useState(false);
	const dragStart = useRef<Position | null>(null);
	const windowPosition = useRef<Position | null>(null);

	useEffect(() => {
		if (!el) return;

		const onActualWindowResize = () => {
			console.log('onActualWindowResize');
			const bounds = el.getBoundingClientRect();

			if (isBoundsOffScreen(bounds)) {
				// Move it to the edge of the screen, but only on the axis that it's off
				const nextX =
					bounds.x < 0
						? 0
						: bounds.right > window.innerWidth
							? window.innerWidth - bounds.width
							: bounds.x;
				const nextY =
					bounds.y < 0
						? 0
						: bounds.bottom > window.innerHeight
							? window.innerHeight - bounds.height
							: bounds.y;

				updatePosition({x: nextX, y: nextY});
			}
		};

		window.addEventListener('resize', onActualWindowResize);

		return () => {
			window.removeEventListener('resize', onActualWindowResize);
		};
	}, [el]);

	useEffect(() => {
		if (!isMouseDown || !el) {
			return;
		}

		const onMouseMove = (e: MouseEvent) => {
			if (!dragStart.current || !windowPosition.current) {
				return;
			}

			const elBounds = el.getBoundingClientRect();

			const deltaX = e.clientX - dragStart.current.x;
			const deltaY = e.clientY - dragStart.current.y;
			const nextX = windowPosition.current.x + deltaX;
			const nextY = windowPosition.current.y + deltaY;

			if (isPositionOffScreen(nextX, nextY, elBounds)) {
				return;
			}

			updatePosition({x: nextX, y: nextY});
		};

		const onMouseUp = () => {
			if (!el) return;
			const bounds = el.getBoundingClientRect();

			windowPosition.current = {
				x: bounds.x,
				y: bounds.y,
			};

			dragStart.current = null;
			setIsMouseDown(false);
		};

		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);

		return () => {
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
		};
	}, [isMouseDown, el]);

	const handleMouseDown = (e: React.MouseEvent) => {
		if (!el) return;

		const bounds = el.getBoundingClientRect();

		windowPosition.current = {
			x: bounds.x,
			y: bounds.y,
		};

		dragStart.current = {
			x: e.clientX,
			y: e.clientY,
		};

		setIsMouseDown(true);
	};

	return {
		isMouseDown,
		handleMouseDown,
		ready: initialPosition !== null,
	};
}

function isPositionOffScreen(x: number, y: number, elementBounds: DOMRect): boolean {
	return (
		y < 0 ||
		y + elementBounds.height > window.innerHeight ||
		x < 0 ||
		x + elementBounds.width > window.innerWidth
	);
}

export function isBoundsOffScreen(bounds: DOMRect): boolean {
	return (
		bounds.y < 0 ||
		bounds.y + bounds.height > window.innerHeight ||
		bounds.x < 0 ||
		bounds.x + bounds.width > window.innerWidth
	);
}
