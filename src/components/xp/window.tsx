import {useEffect, useRef, useState, type PropsWithChildren} from 'react';

export interface WindowControlsProps {
	onMinimize?: () => void;
	onMaximize?: () => void;
	onHelp?: () => void;
	onClose?: () => void;
}

export function WindowTitleBar(props: WindowControlsProps) {
	return (
		<div className="title-bar-controls">
			{props.onMinimize && <button aria-label="Minimize" onClick={props.onMinimize} />}
			{props.onMaximize && <button aria-label="Maximize" onClick={props.onMaximize} />}
			{props.onHelp && <button aria-label="Help" onClick={props.onHelp} />}
			{props.onClose && <button aria-label="Close" onClick={props.onClose} />}
		</div>
	);
}

interface Position {
	x: number;
	y: number;
}

export interface WindowFrameProps extends PropsWithChildren, WindowControlsProps {
	title: string;
	resizable?: boolean;
}

export function WindowFrame({title, children, ...controlProps}: WindowFrameProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [isMouseDown, setIsMouseDown] = useState(false);
	const dragStart = useRef<Position | null>(null);
	const windowPosition = useRef<Position | null>(null);

	useEffect(() => {
		const el = ref.current;

		if (!isMouseDown || !el) {
			return;
		}

		const onMouseMove = (e: MouseEvent) => {
			if (!dragStart.current || !windowPosition.current) {
				return;
			}

			const elBoundsRelativeToScreen = el.getBoundingClientRect();

			const deltaX = e.clientX - dragStart.current.x;
			const deltaY = e.clientY - dragStart.current.y;

			const nextX = windowPosition.current.x + deltaX;
			const nextY = windowPosition.current.y + deltaY;

			const willGoOffScreen =
				nextY < 0 ||
				nextY + elBoundsRelativeToScreen.height > window.innerHeight ||
				nextX < 0 ||
				nextX + elBoundsRelativeToScreen.width > window.innerWidth;

			if (willGoOffScreen) {
				return;
			}

			el.style.transform = `translate(${nextX}px, ${nextY}px)`;
		};

		const onMouseUp = () => {
			if (!el) return;

			const transform = el.getBoundingClientRect();

			windowPosition.current = {
				x: transform.x,
				y: transform.y,
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
	}, [isMouseDown]);

	const handleMouseDown = (e: React.MouseEvent) => {
		const el = ref.current;
		if (!el) return;

		if (!windowPosition.current) {
			const currentWindowPosition = el.getBoundingClientRect();

			windowPosition.current = {
				x: currentWindowPosition.x,
				y: currentWindowPosition.y,
			};
		}

		dragStart.current = {
			x: e.clientX,
			y: e.clientY,
		};

		setIsMouseDown(true);
	};

	return (
		<div className="window absolute w-fit" ref={ref}>
			<div className="title-bar" onMouseDown={handleMouseDown}>
				<div className="title-bar-text select-none">{title}</div>
				<WindowTitleBar {...controlProps} />
			</div>
			<div className="window-body">{children}</div>
		</div>
	);
}
