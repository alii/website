import clsx from 'clsx';
import {motion} from 'framer-motion';
import type {ReactNode} from 'react';
import alistair from '../../public/alistair.jpeg';
import type {DistributedOmit} from '../utils/types';

export function message(
	...args:
		| [key: string, content: ReactNode, className?: string]
		| [message: DistributedOmit<Extract<MessageOrNode, {type?: 'message'}>, 'type'>]
): MessageOrNode {
	if (args.length === 1) {
		const [message] = args;
		return {...message, type: 'message'};
	} else {
		const [key, content, className] = args;
		return {
			type: 'message',
			key,
			content,
			className,
		};
	}
}

message.node = (node: ReactNode): MessageOrNode => ({
	type: 'node',
	node,
});

export type MessageOrNode =
	| {
			type?: 'message';
			key: string;
			content: ReactNode;
			className?: string | undefined;
	  }
	| {
			type: 'node';
			node: ReactNode;
	  };

export interface MessageGroupProps {
	messages: Array<MessageOrNode>;
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

export function MessageGroupContainer({children}: {children: ReactNode}) {
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

			<div className="space-y-1">{children}</div>
		</motion.li>
	);
}

export function MessageGroup({messages}: MessageGroupProps) {
	return (
		<MessageGroupContainer>
			{messages.map((messageOrReactNode, i) => {
				if (messageOrReactNode.type === 'node') {
					return messageOrReactNode.node;
				}

				const {key, content, className} = messageOrReactNode;

				return (
					<MessageBubble
						key={key}
						content={content}
						isFirst={i === 0}
						isLast={i === messages.length - 1}
						className={className}
					/>
				);
			})}
		</MessageGroupContainer>
	);
}
