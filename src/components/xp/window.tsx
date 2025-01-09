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

export interface WindowFrameProps extends PropsWithChildren, WindowControlsProps {
	title: string;
	resizable?: boolean;
}

export function WindowFrame({title, children, ...controlProps}: WindowFrameProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [isMouseDown, setIsMouseDown] = useState(false);

	useEffect(() => {
		const el = ref.current;

		if (!isMouseDown || !el) {
			return;
		}

		const onMouseMove = (e: MouseEvent) => {
			//
		};

		const onMouseUp = () => {
			setIsMouseDown(false);
		};

		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);

		return () => {
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
		};
	}, [isMouseDown]);

	return (
		<div className="window absolute w-fit" ref={ref}>
			<div className="title-bar" onMouseDown={() => setIsMouseDown(true)}>
				<div className="title-bar-text select-none">{title}</div>
				<WindowTitleBar {...controlProps} />
			</div>

			<div className="window-body">{children}</div>
		</div>
	);
}
