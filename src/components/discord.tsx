'use client';

import clsx from 'clsx';
import {SiDiscord} from 'react-icons/si';
import {Props} from './spotify';
import {useUpdatingLanyard} from '../hooks/lanyard';

export function Discord(props: Props) {
	const {data: lanyard} = useUpdatingLanyard(props.lanyard.discord_user.id, props.lanyard);

	const status = lanyard?.discord_status ?? 'offline';

	return (
		<div
			className={clsx(
				'group col-span-2 flex h-52 items-center justify-center rounded-2xl text-4xl transition',
				{
					online: 'bg-green-500 text-white',
					idle: 'bg-orange-400 text-white ',
					dnd: 'bg-red-500 text-white ',
					offline: 'bg-blurple text-white',
				}[status],
			)}
		>
			<div className="-rotate-[8deg] scale-[1.1] space-y-1 text-center md:scale-[1.2]">
				<p>
					<SiDiscord className="inline" /> <span>{status}</span>
				</p>

				{lanyard && (
					<p className="text-base text-white/80">
						{lanyard.discord_user.username}#{lanyard.discord_user.discriminator}
					</p>
				)}
			</div>
		</div>
	);
}
