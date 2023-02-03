import clsx from 'clsx';
import type {PropsWithChildren} from 'react';

export const hoverClassName =
	'transform-gpu transition-all duration-500 will-change-[outline,_transform] group-hover:scale-95 active:scale-100';

export function CardHoverEffect({children, ...props}: PropsWithChildren<{className?: string}>) {
	return <div className={clsx('group', props.className)}>{children}</div>;
}
