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
	tip: <VscInfo className="mr-2 inline text-sm select-none" />,
};

export function Note(props: NoteProps) {
	const className = clsx(
		'p-4 pt-3 not-prose rounded-md space-y-2',
		'[&_code]:inline [&_code]:rounded [&_code]:text-xs [&_code]:p-0.5',
		'[&_a]:underline [&_a:hover]:text-blue-500',

		{
			'bg-yellow-100/90 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-500':
				props.variant === 'warning',

			'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-500': props.variant === 'info',
			'bg-green-50 text-green-600 dark:bg-green-900/40 dark:text-green-500':
				props.variant === 'success',

			'[&_code]:bg-yellow-50 [&_code]:dark:bg-yellow-900/40': props.variant === 'warning',
			'[&_code]:bg-blue-200/90 [&_code]:dark:bg-blue-900/40': props.variant === 'info',
			'[&_code]:bg-green-200/90 [&_code]:dark:bg-green-900/40': props.variant === 'success',
		},
	);

	return (
		<div className={className}>
			<div>
				{icons[props.variant]}
				{props.title && <h2 className="inline text-xs">{props.title}</h2>}
			</div>

			<div className="text-sm">{props.children}</div>
		</div>
	);
}
