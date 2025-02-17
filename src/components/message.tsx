import clsx from 'clsx';
import {motion} from 'framer-motion';
import type {ReactNode} from 'react';
import alistair from '../../public/alistair.jpeg';

export interface MessageGroupProps {
	messages: Array<{key: string; content: ReactNode}>;
}

const group = {
	hidden: {opacity: 0, x: -5},
	show: {opacity: 1, x: 0},
};

const item = {
	hidden: {opacity: 0},
	show: {opacity: 1},
};

function MessageBubble({
	isLast,
	isFirst,
	content,
}: {
	isLast?: boolean;
	isFirst?: boolean;
	content: ReactNode;
}) {
	return (
		<motion.div
			transition={{
				type: 'spring',
				mass: 1,
				damping: 100,
				stiffness: 500,
			}}
			variants={item}
			className={clsx(
				'w-fit border border-neutral-200 bg-white text-sm shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:shadow-none',

				isLast && isFirst
					? 'rounded-2xl'
					: isFirst
						? 'rounded-b-lg rounded-t-2xl'
						: isLast
							? 'rounded-b-2xl rounded-t-lg'
							: 'rounded-lg',
			)}
		>
			{content}
		</motion.div>
	);
}

export function MessageGroup({messages}: MessageGroupProps) {
	return (
		<motion.li
			transition={{
				type: 'spring',
				mass: 11,
				damping: 140,
				stiffness: 500,

				staggerChildren: 0.2,
			}}
			variants={group}
			className="flex items-end space-x-2"
		>
			<img
				src={alistair.src}
				className="size-8 rounded-full"
				alt="Me standing in front of some tents"
			/>

			<div className="space-y-1">
				{messages.map(({key: id, content}, i) => (
					<MessageBubble
						key={id}
						content={content}
						isFirst={i === 0}
						isLast={i === messages.length - 1}
					/>
				))}
			</div>
		</motion.li>
	);
}
