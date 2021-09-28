// came out swinging – the wonder years

import React, {Fragment, useEffect, useReducer} from 'react';
import day from 'dayjs';
import {PinnedRepo, useGitHubPinnedRepos} from '../hooks/github';
import {AnimatePresence, motion} from 'framer-motion';
import {GetStaticProps} from 'next';
import {
	SiAmazonaws,
	SiBabel,
	SiDocker,
	SiGit,
	SiGithub,
	SiGo,
	SiJava,
	SiNextDotJs,
	SiNodeDotJs,
	SiPostgresql,
	SiReact,
	SiRedis,
	SiStyledComponents,
	SiTailwindcss,
	SiTwitter,
	SiTypescript,
	SiWebpack,
	SiWebstorm,
	SiYarn,
} from 'react-icons/si';
import {IconType} from 'react-icons/lib';
import {mockPinnedRepos} from '../offline/mock';
import {ListItem} from '../components/list-item';
import {T} from '../i18n/translator';
import {DISCORD_ID} from '../components/song';
import useLanyard, {
	Data as LanyardData,
	LanyardError,
	LanyardResponse,
} from 'use-lanyard';

const birthday = day('2 November 2004');
const age = Math.abs(
	new Date(Date.now() - birthday.toDate().getTime()).getUTCFullYear() - 1970,
);

const isBirthday = day().isSame('2 November 2004');

interface Props {
	pinnedRepos: PinnedRepo[];
	lanyard: LanyardData;
}

export default function Index(props: Props) {
	const {data: projects = props.pinnedRepos} = useGitHubPinnedRepos('alii');

	useLanyard(DISCORD_ID, {
		fallbackData: props.lanyard,
	});

	useEffect(() => {
		if (!isBirthday) {
			return;
		}

		// TODO: Add birthday fireworks
	}, []);

	return (
		<Fragment>
			<div className="space-y-4">
				<div className="flex space-x-3">
					<SocialLink href="https://github.com/alii" icon={SiGithub} />
					<SocialLink href="https://twitter.com/alistaiiiir" icon={SiTwitter} />
				</div>
				<h1 className="text-3xl sm:text-4xl md:text-6xl font-bold">
					<T phrase="Hey, I'm Alistair" />
				</h1>
				<p className="opacity-80">
					<T phrase="intro.intro" />
				</p>
			</div>

			<div className="space-y-4">
				<h1 className="text-2xl sm:text-3xl font-bold">What do I do? 💭</h1>
				<p className="opacity-80">
					<T phrase="intro.projects" />
				</p>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-3 auto-cols-max">
					{projects?.map(project => (
						<ProjectCard key={project.repo} repo={project} />
					))}
				</div>
			</div>

			<div className="space-y-4">
				<h1 className="text-2xl sm:text-3xl font-bold">Technologies 💻</h1>
				<p className="opacity-80">
					<T phrase="intro.technologies" />
				</p>
				<ul className="grid grid-cols-3 sm:grid-cols-4 gap-4">
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
				</ul>
			</div>
		</Fragment>
	);
}

function SocialLink({href, icon}: {href: string; icon: IconType}) {
	return (
		<a href={href} target="_blank" rel="noreferrer">
			{icon({className: 'h-8 w-8 opacity-70 hover:opacity-100'})}
		</a>
	);
}

function ProjectCard({repo: project}: {repo: PinnedRepo}) {
	const [isOpen, toggle] = useReducer(x => !x, false);

	return (
		<motion.div
			animate={{height: isOpen ? 'auto' : '54px'}}
			className="relative overflow-hidden flex flex-col bg-white no-underline bg-opacity-5 border border-white border-opacity-10 rounded-md md:rounded-lg hover:bg-opacity-10"
		>
			<button
				type="button"
				className="focus:outline-none select-none font-bold border-b border-white border-opacity-10 text-lg flex items-center space-x-2 px-5 py-4 cursor-pointer"
				onClick={toggle}
			>
				<div className="flex-1 text-left flex items-center space-x-2">
					<span>{project.repo}</span>
					<span className="text-xs flex items-center space-x-3">
						<span className="space-x-1">
							<span>⭐</span>
							<span>{project.stars}</span>
						</span>
						<span className="space-x-1">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-4 w-4 inline"
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
						className="hover:bg-opacity-10 bg-white bg-opacity-0 rounded-full p-1"
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
						className="h-full flex"
					>
						<div className="px-5 py-4 flex flex-col space-y-4">
							<p className="flex-1">{project.description}</p>

							<div>
								<a
									href={`https://github.com/${project.owner}/${project.repo}`}
									target="_blank"
									rel="noreferrer"
									className="select-none inline-flex items-center space-x-2 no-underline bg-white bg-opacity-10 rounded-full px-6 py-2 transition-transform hover:scale-95 duration-500"
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
	)
		.then(async res => res.json() as Promise<PinnedRepo[]>)
		.catch(e => {
			if (process.env.NODE_ENV === 'development') {
				return mockPinnedRepos;
			}

			// Something has probably gone wrong... (likely a network error)
			throw e;
		});

	const lanyard = await fetch(
		`https://api.lanyard.rest/v1/users/${DISCORD_ID}`,
	);

	const lanyardBody = (await lanyard.json()) as LanyardResponse;

	if ('error' in lanyardBody) {
		throw new LanyardError(lanyard.status, lanyardBody.error.message);
	}

	return {
		props: {pinnedRepos, lanyard: lanyardBody.data},
		revalidate: 120,
	};
};
