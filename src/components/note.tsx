import clsx from 'clsx';
import type {ReactNode} from 'react';
import {VscCheck, VscInfo, VscWarning} from 'react-icons/vsc';

export type NoteProps = {
	readonly title?: string;
	readonly children: ReactNode;
	readonly variant: 'warning' | 'info' | 'success';
};

const icons = {
	warning: <VscWarning className="mr-2 inline text-sm select-none" />,
	info: <VscInfo className="mr-2 inline text-sm select-none" />,
	success: <VscCheck className="mr-2 inline text-sm select-none" />,
};

const variants = {
	warning:
		'border-yellow-500 bg-yellow-50 text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300',
	info: 'border-sky-500 bg-sky-50 text-sky-800 dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
	success:
		'border-green-500 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-950/40 dark:text-green-300',
};

export function Note(props: NoteProps) {
	return (
		<div
			className={clsx(
				'not-prose my-3.5 border border-l-4 px-3 py-2.5 text-[13px] [&_a:hover]:underline',
				variants[props.variant],
			)}
		>
			{props.title && (
				<div className="mb-1 text-[11px] font-bold tracking-wide uppercase">
					{icons[props.variant]}
					{props.title}
				</div>
			)}

			<div className="[&_p]:m-0">{props.children}</div>
		</div>
	);
}
