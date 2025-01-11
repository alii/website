import clsx from 'clsx';
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

	const [zIndex, isActive, listeners] = useActiveWindowStack();

	return (
		<div
			ref={ref}
			{...listeners}
			className={clsx('window absolute w-fit')}
			style={{
				zIndex,
				filter: isActive ? 'grayscale(0%)' : 'grayscale(30%)',
			}}
		>
			<div className={clsx('title-bar', !isActive && 'inactive')} onMouseDown={handleMouseDown}>
				<div className="title-bar-text">{title}</div>
				<WindowTitleBar {...controlProps} />
			</div>

			<div className={clsx(!isActive && 'pointer-events-none')}>
				<div className="window-body">{children}</div>
			</div>
		</div>
	);
}
