import dayjs from 'dayjs';
import type {GetStaticProps} from 'next';
import {useLanyardWS, type Data} from 'use-lanyard';
import {Spinquee} from '../components/spinquee';
import {getMapURL} from '../server/apple-maps';
import {getRecentBlogPosts, type PartialBlogPost} from '../server/blog';
import {env} from '../server/env';
import {getLanyard} from '../server/lanyard';
import {discordId} from '../utils/constants';

export interface Props {
	lanyard: Data;
	map: string;
	location: string;
	recentBlogPosts: PartialBlogPost[];
}

export const getStaticProps: GetStaticProps<Props> = async () => {
	const lanyard = await getLanyard(discordId);
	const location = lanyard.kv.location ?? env.DEFAULT_LOCATION;

	const map = getMapURL(location);

	const allBlogPosts = await getRecentBlogPosts();
	const recentBlogPosts = allBlogPosts
		.sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix())
		.slice(0, 3);

	return {
		revalidate: 10,
		props: {
			map,
			location,
			lanyard,
			recentBlogPosts,
		},
	};
};

export default function Home(props: Props) {
	const lanyard = useLanyardWS(discordId, {
		initialData: props.lanyard,
	})!;

	const status = lanyard.discord_status ?? 'offline';

	return (
		<div className="absolute inset-0 overflow-hidden">
			<div className="relative flex h-full w-full">
				<Spinquee size={500}>
					<div className="font-title text-2xl text-neutral-500 dark:text-white">hiello</div>
					<div className="font-title text-2xl text-neutral-500 dark:text-white">pg</div>
				</Spinquee>
			</div>
		</div>
	);
}
