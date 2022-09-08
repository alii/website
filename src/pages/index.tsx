import React, {useReducer} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import type {GetStaticProps} from 'next';
import {
	SiAmazonaws,
	SiBabel,
	SiDocker,
	SiGit,
	SiGithub,
	SiGo,
	SiJava,
	SiMongodb,
	SiNextdotjs as SiNextDotJs,
	SiNodedotjs as SiNodeDotJs,
	SiPostgresql,
	SiReact,
	SiRedis,
	SiStyledcomponents as SiStyledComponents,
	SiTailwindcss,
	SiTwitter,
	SiTypescript,
	SiWebpack,
	SiWebstorm,
	SiYarn,
} from 'react-icons/si';
import {GiSkateboard} from 'react-icons/gi';
import {HiOutlineLocationMarker} from 'react-icons/hi';
import type {
	Data as LanyardData,
	LanyardResponse} from 'use-lanyard';
import {
	LanyardError,
	useLanyard,
} from 'use-lanyard';
import type {PinnedRepo} from '../hooks/github';
import {useGitHubPinnedRepos} from '../hooks/github';
import {ListItem} from '../components/list-item';
import {DISCORD_ID} from '../components/song';
import {age} from '../util/time';
import dayjs from 'dayjs';

import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

type Props = {
	pinnedRepos: PinnedRepo[];
	lanyard: LanyardData;
};

export default function Index(props: Props) {
	const {data: projects = props.pinnedRepos} = useGitHubPinnedRepos('alii');

	const {data: lanyard} = useLanyard(DISCORD_ID, {
		fallbackData: props.lanyard,
	});

	const boostedActivity = lanyard?.activities.find(
		activity => activity.application_id === '932730208820265011',
	);

	return (
		<>
			<div className="space-y-4">
				<div className="flex items-center space-x-3">
					<a
						href="https://github.com/alii/website"
						target="_blank"
						rel="noreferrer"
						aria-label="GitHub Profile"
					>
						<SiGithub className="h-7 w-7" />
						<span className="sr-only">GitHub Profile</span>
					</a>

					<a
						href="https://twitter.com/alistaiiiir"
						target="_blank"
						rel="noreferrer"
						aria-label="Twitter Profile"
					>
						<SiTwitter className="h-7 w-7" />
						<span className="sr-only">Twitter Profile</span>
					</a>

					{lanyard && (
						<p className="inline-flex items-center space-x-2">
							<a
								target="_blank"
								href={`https://search.alistair.sh/?q=!maps+${lanyard.kv.location}`}
								rel="noreferrer"
								className="flex items-center rounded-full bg-gray-200 px-2 pr-3 text-neutral-600 no-underline transition-colors dark:bg-gray-700 dark:text-white dark:text-opacity-50 dark:hover:bg-gray-800"
							>
								<span>
									<HiOutlineLocationMarker className="inline dark:text-white" />
									&nbsp;
								</span>

								<span className="-mb-0.5">
									{lanyard.kv.location}
									&nbsp;
								</span>

								<span className="-mb-0.5 ml-1 block h-[6px] w-[6px] animate-pulse rounded-full bg-gray-600 dark:bg-white" />
							</a>

							{boostedActivity?.timestamps && (
								<p className="flex items-center rounded-full bg-gray-200 px-2 pr-3 text-neutral-600 no-underline transition-colors dark:bg-gray-700 dark:text-white dark:text-opacity-50">
									<span>
										<GiSkateboard className="inline dark:text-white" />
										&nbsp;
									</span>

									<span className="-mb-0.5">
										Boosted boarding for{' '}
										{dayjs(boostedActivity.timestamps.start).fromNow(true)}
										&nbsp;
									</span>

									<span className="-mb-0.5 ml-1 block h-[6px] w-[6px] animate-pulse rounded-full bg-gray-600 dark:bg-white" />
								</p>
							)}
						</p>
					)}
				</div>

				<h1 className="text-3xl font-bold sm:text-4xl md:text-6xl">
					Hey, I'm{' '}
					<span className="text-blue-700 dark:text-white">Alistair</span> ✌️
				</h1>

				<p className="opacity-80">
					I'm a ~{age.toPrecision(7)} year old software engineer from the United
					Kingdom. I'm interested in full stack web development including large
					scale frontend applications and performant serverside code.
				</p>
			</div>

			<div className="space-y-4">
				<h1 className="text-2xl font-bold sm:text-3xl">What do I do? 💭</h1>
				<p className="opacity-80">
					Honestly, a few too many things to count on one hand... I'm currently
					having a fantastic time working with{' '}
					<a href="https://hop.io" target="_blank" rel="noreferrer">
						Hop
					</a>{' '}
					- we're building the e2e realtime engine. Below are some of the more
					popular open source projects I've worked on. In total, the following
					repos have earnt me{' '}
					{projects.reduce(
						(acc, project) => acc + parseInt(project.stars, 10),
						0,
					)}{' '}
					stars! Thank you! 💖
				</p>

				<div className="grid auto-cols-max grid-cols-1 gap-1 sm:grid-cols-2 sm:gap-3">
					{projects.map(project => (
						<ProjectCard key={project.repo} repo={project} />
					))}
				</div>
			</div>

			<div className="space-y-4">
				<h1 className="text-2xl font-bold sm:text-3xl">Technologies 💻</h1>

				<p className="opacity-80">
					I use a wide range of tools to tackle each hurdle in the most
					efficient manner possible. I really love working with containersation,
					especially Docker; it's proven to be a reliable bit of kit for both
					production and development environments.
				</p>

				<ul className="grid grid-cols-3 gap-4 sm:grid-cols-4">
					<ListItem icon={SiDocker} text="Docker" />
					<ListItem icon={SiRedis} text="Redis" />
					<ListItem icon={SiPostgresql} text="Postgres" />
					<ListItem icon={SiReact} text="React.js" />
					<ListItem icon={SiNodeDotJs} text="Node.js" />
					<ListItem icon={SiTypescript} text="TypeScript" />
					<ListItem icon={SiGo} text="Golang" />
					<ListItem icon={SiJava} text="Java" />
					<ListItem icon={SiAmazonaws} text="AWS" />
					<ListItem icon={SiWebstorm} text="WebStorm" />
					<ListItem icon={SiNextDotJs} text="Next.js" />
					<ListItem icon={SiWebpack} text="Webpack" />
					<ListItem icon={SiBabel} text="Babel" />
					<ListItem icon={SiYarn} text="Yarn" />
					<ListItem icon={SiTailwindcss} text="TailwindCSS" />
					<ListItem icon={SiGit} text="Git" />
					<ListItem icon={SiStyledComponents} text="styled-components" />
					<ListItem icon={SiMongodb} text="Mongo" />
				</ul>
			</div>
		</>
	);
}

function ProjectCard({repo: project}: {repo: PinnedRepo}) {
	const [isOpen, toggle] = useReducer(x => !x, false);

	return (
		<motion.div
			animate={{height: isOpen ? 'auto' : '54px'}}
			className="relative flex flex-col overflow-hidden rounded-md border-white/10 bg-gradient-to-tr from-blue-100 to-blue-700/5 text-blue-900/80 no-underline dark:border dark:from-white/5 dark:to-white/5 dark:text-gray-100 dark:hover:bg-white/10 md:rounded-lg"
		>
			<button
				type="button"
				className="flex cursor-pointer select-none items-center space-x-2 border-b border-white/10 py-4 px-5 text-lg font-bold focus:outline-none"
				onClick={toggle}
			>
				<div className="flex flex-1 items-center space-x-2 text-left">
					<span>{project.repo}</span>
					<span className="flex items-center space-x-3 text-xs">
						<span className="space-x-1">
							<span>⭐</span>
							<span>{project.stars}</span>
						</span>
						<span className="space-x-1">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="inline h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
								/>
							</svg>
							<span>{project.forks}</span>
						</span>
					</span>
				</div>
				<div>
					<motion.div
						className="rounded-full bg-white/0 p-1 hover:bg-white/10"
						animate={{rotate: isOpen ? 90 : 0}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-5 w-5"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fillRule="evenodd"
								d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
								clipRule="evenodd"
							/>
						</svg>
					</motion.div>
				</div>
			</button>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{opacity: 0}}
						animate={{opacity: 1}}
						exit={{opacity: 0}}
						className="flex h-full"
					>
						<div className="flex flex-col space-y-4 py-4 px-5">
							<p className="flex-1">{project.description}</p>

							<div>
								<a
									href={`https://github.com/${project.owner}/${project.repo}`}
									target="_blank"
									rel="noreferrer"
									className="inline-flex select-none items-center space-x-2 rounded-full bg-blue-700 py-2 px-6 text-white no-underline transition-transform duration-500 hover:scale-95 dark:bg-white/10"
								>
									<span>View Project</span>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-6 w-6"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
										/>
									</svg>
								</a>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
}

export const getStaticProps: GetStaticProps<Props> = async function () {
	const pinnedRepos = await fetch(
		'https://gh-pinned-repos.egoist.sh/?username=alii',
	).then(async response => response.json() as Promise<PinnedRepo[]>);

	const request = new Request(
		`https://api.lanyard.rest/v1/users/${DISCORD_ID}`,
	);

	const response = await fetch(request);

	const body = (await response.json()) as LanyardResponse;

	if ('error' in body) {
		throw new LanyardError(request, response, body.error.message);
	}

	return {
		props: {pinnedRepos, lanyard: body.data},
		revalidate: 120,
	};
};
