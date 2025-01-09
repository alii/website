import {useEffect, useRef, useState, type RefObject} from 'react';
import type {Position} from '../types';

interface UseWindowDragReturn {
	isMouseDown: boolean;
	handleMouseDown: (e: React.MouseEvent) => void;
}

export function useWindowDrag(ref: RefObject<HTMLElement>): UseWindowDragReturn {
	const [isMouseDown, setIsMouseDown] = useState(false);
	const dragStart = useRef<Position | null>(null);
	const windowPosition = useRef<Position | null>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		const onActualWindowResize = () => {
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

				el.style.transform = `translate(${nextX}px, ${nextY}px)`;
			}
		};

		window.addEventListener('resize', onActualWindowResize);

		return () => {
			window.removeEventListener('resize', onActualWindowResize);
		};
	}, [ref]);

	useEffect(() => {
		const el = ref.current;
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

			el.style.transform = `translate(${nextX}px, ${nextY}px)`;
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
	}, [isMouseDown, ref]);

	const handleMouseDown = (e: React.MouseEvent) => {
		const el = ref.current;
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
