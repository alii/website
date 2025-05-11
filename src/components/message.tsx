import clsx from 'clsx';
import {motion} from 'framer-motion';
import type {ReactNode} from 'react';
import alistair from '../../public/alistair.jpeg';

export interface Message {
	key: string;
	content: ReactNode;
	className?: string;
}

export interface MessageGroupProps {
	messages: Array<Message>;
}

const group = {
	hidden: {opacity: 0, y: 20},
	show: {opacity: 1, y: 0},
};

const item = {
	hidden: {opacity: 0, y: 20},
	show: {opacity: 1, y: 0},
};

function MessageBubble({
	content,
	className,
}: {
	isLast?: boolean;
	isFirst?: boolean;
	content: ReactNode;
	className?: string | undefined;
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
				'w-fit bg-zinc-100 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:shadow-none',
				className,

				'rounded-[20px]',
				// '[mask:paint(squircle)]',
				// '[--squircle-radius:12px]',
				// '[--squircle-smooth:0.35]',
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
				damping: 80,
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
				{messages.map(({key: id, content, className}, i) => (
					<MessageBubble
						key={id}
						content={content}
						isFirst={i === 0}
						isLast={i === messages.length - 1}
						className={className}
					/>
				))}
			</div>
		</motion.li>
	);
}
