import React, {useReducer} from 'react';
import day from 'dayjs';
import {PinnedRepo, useGitHubPinnedRepos} from '../hooks/github';
import {AnimatePresence, motion} from 'framer-motion';
import {GetStaticProps} from 'next';

const birthday = day('2 November 2004').toDate();
const age = Math.abs(
	new Date(Date.now() - birthday.getTime()).getUTCFullYear() - 1970,
);

interface Props {
	pinnedRepos: PinnedRepo[];
}

export default function Index(props: Props) {
	const {data: projects = props.pinnedRepos} = useGitHubPinnedRepos('alii');

	return (
		<div className="max-w-3xl mx-auto py-24 space-y-12">
			<div className="space-y-4">
				<h1 className="text-6xl font-bold">Hey, I'm Alistair ✌️</h1>
				<p className="opacity-80">
					I'm a {age} year old software engineer from the United Kingdom. I'm
					interested in large scale frontend applications, performant and
					responsive serverside code. I've recently delved into lower level
					languages with the help of some friends 😃
				</p>
			</div>

			<div className="space-y-4">
				<h1 className="text-3xl font-bold">What do I do? 💭</h1>
				<p className="opacity-80">
					Honestly, a few too many things to count on one hand... I'm currently
					having a fantastic time working with{' '}
					<a href="https://twitter.com/gigglapp">Giggl</a> - we're building a
					way to watch &amp; browse the web, together. Below are some of the
					more popular open source projects I've worked on. In total, the
					following repos have earnt me{' '}
					{projects?.reduce((stars, repo) => stars + repo.stars, 0)} stars!
					Thank you! 💖
				</p>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-3 auto-cols-max">
					{projects?.map(project => (
						<ProjectCard key={project.repo} repo={project} />
					))}
				</div>
			</div>
		</div>
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
				className="select-none font-bold border-b border-white border-opacity-10 text-lg flex items-center space-x-2 px-5 py-4 cursor-pointer"
				onClick={toggle}
			>
				<div className="flex-1 text-left flex items-center space-x-2">
					<span>{project.repo}</span>
					<span className="text-xs">⭐ {project.stars}</span>
				</div>
				<div>
					<motion.div animate={{rotate: isOpen ? 90 : 0}}>
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
									className="select-none inline-flex items-center space-x-2 no-underline bg-white bg-opacity-10 rounded-full px-6 py-2"
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
	).then(async res => res.json() as Promise<PinnedRepo[]>);

	return {
		props: {pinnedRepos},
		revalidate: 120,
	};
};
