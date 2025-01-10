import {useRef, type PropsWithChildren} from 'react';
import {useWindowDrag} from '../hooks/use-window-drag';
import {useActiveWindowStack} from '../state';

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
	const {handleMouseDown} = useWindowDrag(ref);

	const [zIndex, onActiveWindowMouseDown] = useActiveWindowStack();

	return (
		<div
			ref={ref}
			onMouseDown={onActiveWindowMouseDown}
			className="window absolute w-fit"
			style={{zIndex}}
		>
			<div className="title-bar" onMouseDown={handleMouseDown}>
				<div className="title-bar-text select-none">{title}</div>
				<WindowTitleBar {...controlProps} />
			</div>

			<div className="window-body">{children}</div>
		</div>
	);
}
