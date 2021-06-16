import React from 'react';
import {Activity as ActivityType, useLanyard} from 'use-lanyard';
import dayjs from 'dayjs';
import {Consts} from '../core/consts';
import relativeTime from 'dayjs/plugin/relativeTime';
import Image from 'next/image';

dayjs.extend(relativeTime);

const PRESENCE_TYPE = 0;

export function Activity() {
	const {data: lanyard} = useLanyard(Consts.DiscordId);

	const activity = lanyard?.activities.find(activity => activity.type === PRESENCE_TYPE);

	if (!activity) {
		return null;
	}

	return (
		<div className="glass p-5 select-none">
			<div className="flex items-center">
				<ActivityImage activity={activity} />
				<p className="ml-4 text-sm flex flex-col justify-between leading-snug">
					<span className="font-bold">Playing {activity.name}</span>
					<span className="opacity-75">{activity.state}</span>
					<span className="opacity-50">{activity.details}</span>
					<span className="opacity-50">{dayjs(activity.timestamps?.start).fromNow(true)} elapsed</span>
				</p>
			</div>
		</div>
	);
}

function ActivityImage({activity}: {activity: ActivityType}) {
	if (!activity.assets || !activity.application_id) {
		return null;
	}

	try {
		return (
			<Image
				src={`https://cdn.discordapp.com/app-assets/${BigInt(activity.application_id).toString()}/${
					activity.assets.large_image
				}.png`}
				height={64}
				width={64}
				alt={activity.assets.large_text}
				className="h-16 w-16 rounded-md"
			/>
		);
	} catch (error: unknown) {
		// Likely happened because BigInt was not available here.
		console.warn(error);
		return null;
	}
}
