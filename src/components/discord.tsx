'use client';

import clsx from 'clsx';
import Link from 'next/link';
import {SiDiscord} from 'react-icons/si';
import {hoverClassName} from './card';
import {Props} from './spotify';
import {useUpdatingLanyard} from '../hooks/lanyard';

export function Discord(props: Props) {
	const {data: lanyard} = useUpdatingLanyard(props.lanyard.discord_user.id, props.lanyard);

	return (
		<Link
			href="https://twitter.com/alistaiir"
			target="_blank"
			rel="noopener noreferrer"
			className={clsx(
				'group col-span-2 flex h-52 items-center justify-center rounded-2xl text-4xl',
				{
					online: 'bg-green-500 text-white hover:bg-green-600',
					idle: 'bg-orange-400 text-white hover:bg-orange-500',
					dnd: 'bg-red-500 text-white hover:bg-red-600',
					offline: 'hover:bg-blurple-600 bg-blurple text-white',
				}[lanyard?.discord_status ?? 'offline'],
				hoverClassName,
			)}
		>
			<span className="transform-gpu transition group-hover:-rotate-[10deg] group-hover:scale-[1.3]">
				<SiDiscord />
			</span>
		</Link>
	);
}
