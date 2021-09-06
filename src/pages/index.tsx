import React from 'react';
import Image from 'next/image';
import {motion, Variants} from 'framer-motion';
import {useGitHubPinnedRepos} from '../hooks/github';

const variants: Variants = {
	hidden: {y: -10, opacity: 0},
	shown: {y: 0, opacity: 1},
};

export default function Index() {
	const {data: pinnedRepos} = useGitHubPinnedRepos('alii');

	return (
		<div className="p-5 flex space-x-4 min-h-full">
			<div>
				<Image
					src="/me.png"
					alt="Selfie"
					width="50px"
					height="50px"
					className="object-cover rounded-full motion-safe:animate-pulse"
				/>
			</div>
			<motion.div
				initial="hidden"
				animate="shown"
				transition={{delayChildren: 0.2, staggerChildren: 0.2}}
				className="bg-gray-900 bg-blur bg-opacity-50 h-full flex-1 p-5 space-y-7"
			>
				<motion.div variants={variants} className="flex">
					<div className="flex-1">
						<h1 className="text-3xl font-semibold">alistair smith</h1>
						<p>typescript, java, go, c++</p>
					</div>
					<div className="float-right">listening to spotify</div>
				</motion.div>

				<motion.div variants={variants}>
					<h1 className="text-xl font-semibold">projects</h1>

					<motion.div
						className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 pt-5"
						transition={{staggerChildren: 0.2}}
					>
						{pinnedRepos?.map(repo => (
							<motion.div
								key={repo.repo}
								className="bg-white bg-opacity-10 p-2"
								variants={{
									hidden: {opacity: 0},
									shown: {opacity: 1},
								}}
								style={{
									borderLeft: `4px solid ${repo.languageColor}`,
								}}
							>
								<h2 className="text-lg">
									<span>{repo.owner}/</span>
									<span className="font-bold">{repo.repo}</span>
								</h2>
								<p className="text-md">{repo.description}</p>
							</motion.div>
						))}
					</motion.div>
				</motion.div>
			</motion.div>
		</div>
	);
}
