import React from 'react';
import Image from 'next/image';
import {motion, Variants} from 'framer-motion';

const variants: Variants = {
	hidden: {y: -10, opacity: 0},
	shown: {y: 0, opacity: 1},
};

export default function Index() {
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
				transition={{staggerChildren: 0.1}}
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

					<motion.div variants={variants}>hi</motion.div>
				</motion.div>
			</motion.div>
		</div>
	);
}
