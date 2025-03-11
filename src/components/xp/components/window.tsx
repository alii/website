import clsx from 'clsx';
import {AnimatePresence, motion} from 'framer-motion';
import {useState, type PropsWithChildren} from 'react';
import {useIsHydrated} from '../hooks/is-hydrated';
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
	const [ref, setRef] = useState<HTMLDivElement | null>(null);
	const {handleMouseDown} = useWindowDrag(ref);
	const ready = useIsHydrated();
	const [zIndex, isActive, listeners] = useActiveWindowStack();

	return (
		<AnimatePresence initial={false}>
			{ready && (
				<motion.div
					initial={{opacity: 0}}
					animate={{opacity: 1}}
					exit={{opacity: 0}}
					ref={setRef}
					transition={{duration: 1}}
					{...listeners}
					className={clsx('window absolute w-fit')}
					style={{
						zIndex,
						filter: isActive ? 'grayscale(0%)' : 'grayscale(30%)',
					}}
				>
					<div
						className={clsx('title-bar', !isActive && 'inactive')}
						onMouseDown={handleMouseDown}
						onTouchStart={handleMouseDown}
					>
						<div className="title-bar-text">{title}</div>
						<WindowTitleBar {...controlProps} />
					</div>

					<div className={clsx(!isActive && 'pointer-events-none')}>
						<div className="window-body">{children}</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
