import {useEvent} from 'alistair/hooks';
import {useEffect, useId, useRef, useState, useSyncExternalStore} from 'react';
import {memoJsonParse} from '../../../lib/json';
import type {Position} from '../types';

function getRandomPosition(): Position {
	const maxX = Math.max(0, window.innerWidth - 300 - 50);
	const maxY = Math.max(0, window.innerHeight - 200 - 50);

	return {
		x: Math.floor(Math.random() * maxX) + 25,
		y: Math.floor(Math.random() * maxY) + 25,
	};
}

interface UseWindowDragReturn {
	isMouseDown: boolean;
	handleMouseDown: (e: React.MouseEvent | React.TouchEvent, isActive: boolean) => void;
}

export function useWindowDrag(el: HTMLElement | null): UseWindowDragReturn {
	const id = useId();

	const initialPosition = useSyncExternalStore(
		() => () => {},
		() => {
			const position = memoJsonParse<Position>(
				window.localStorage.getItem(`window-position-${id}`),
			);

			if (position) {
				return position;
			}

			const next = getRandomPosition();
			window.localStorage.setItem(`window-position-${id}`, JSON.stringify(next));

			return next;
		},
		() => null,
	);

	const updatePosition = useEvent((position: Position) => {
		if (!el) return;
		window.localStorage.setItem(`window-position-${id}`, JSON.stringify(position));
		el.style.transform = `translate(${position.x}px, ${position.y}px)`;
	});

	useEffect(() => {
		if (!el || !initialPosition) {
			return;
		}

		el.style.transform = `translate(${initialPosition.x}px, ${initialPosition.y}px)`;
	}, [initialPosition, el]);

	const [isMouseDown, setIsMouseDown] = useState(false);
	const dragStart = useRef<Position | null>(null);
	const windowPosition = useRef<Position | null>(null);

	useEffect(() => {
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

		const onMouseMove = (e: MouseEvent | TouchEvent) => {
			if (!dragStart.current || !windowPosition.current) {
				return;
			}

			if ('touches' in e) {
				e.preventDefault();
				if (!e.touches[0]) return;
			}

			const elBounds = el.getBoundingClientRect();
			const clientX =
				'touches' in e && e.touches[0] ? e.touches[0].clientX : (e as MouseEvent).clientX;
			const clientY =
				'touches' in e && e.touches[0] ? e.touches[0].clientY : (e as MouseEvent).clientY;

			const deltaX = clientX - dragStart.current.x;
			const deltaY = clientY - dragStart.current.y;
			const nextX = windowPosition.current.x + deltaX;
			const nextY = windowPosition.current.y + deltaY;

			const validX =
				nextX >= 0 && nextX + elBounds.width <= window.innerWidth
					? nextX
					: windowPosition.current.x;
			const validY =
				nextY >= 0 && nextY + elBounds.height <= window.innerHeight
					? nextY
					: windowPosition.current.y;

			if (validX !== windowPosition.current.x || validY !== windowPosition.current.y) {
				updatePosition({x: validX, y: validY});
			}
		};

		const onMouseUp = (e: MouseEvent | TouchEvent) => {
			if ('touches' in e) {
				e.preventDefault();
			}

			if (!el) return;
			const bounds = el.getBoundingClientRect();

			windowPosition.current = {
				x: bounds.x,
				y: bounds.y,
			};

			dragStart.current = null;
			setIsMouseDown(false);
		};

		document.addEventListener('mousemove', onMouseMove, {passive: false});
		document.addEventListener('mouseup', onMouseUp);
		document.addEventListener('touchmove', onMouseMove, {passive: false});
		document.addEventListener('touchend', onMouseUp);
		document.addEventListener('touchcancel', onMouseUp);

		return () => {
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
			document.removeEventListener('touchmove', onMouseMove);
			document.removeEventListener('touchend', onMouseUp);
			document.removeEventListener('touchcancel', onMouseUp);
		};
	}, [isMouseDown, el]);

	const handleMouseDown = (e: React.MouseEvent | React.TouchEvent, isActive: boolean) => {
		if (!el) return;

		if (!isActive) {
			return;
		}

		if ('touches' in e) {
			if (!e.touches[0]) return;

			const touch = e.touches[0];
			const startTime = Date.now();
			const startX = touch.clientX;
			const startY = touch.clientY;

			const touchTimeout = setTimeout(() => {
				const dx = Math.abs(touch.clientX - startX);
				const dy = Math.abs(touch.clientY - startY);
				if (Date.now() - startTime > 100 || dx > 5 || dy > 5) {
					e.preventDefault();
					startDrag(touch.clientX, touch.clientY, e);
				}
			}, 100);

			const cleanup = () => {
				clearTimeout(touchTimeout);
				document.removeEventListener('touchend', cleanup);
				document.removeEventListener('touchcancel', cleanup);
			};

			document.addEventListener('touchend', cleanup, {once: true});
			document.addEventListener('touchcancel', cleanup, {once: true});
		} else {
			startDrag(e.clientX, e.clientY, e);
		}
	};

	const startDrag = (clientX: number, clientY: number, e: React.MouseEvent | React.TouchEvent) => {
		const bounds = el!.getBoundingClientRect();

		windowPosition.current = {
			x: bounds.x,
			y: bounds.y,
		};

		dragStart.current = {
			x: clientX,
			y: clientY,
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
