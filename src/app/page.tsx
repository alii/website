import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import {HiOutlineExternalLink} from 'react-icons/hi';
import {
	SiAmazonaws,
	SiBabel,
	SiDiscord,
	SiDocker,
	SiGit,
	SiGithub,
	SiGo,
	SiJavascript,
	SiMongodb,
	SiNextdotjs,
	SiNodedotjs,
	SiPostgresql,
	SiReact,
	SiRedis,
	SiSpotify,
	SiTailwindcss,
	SiTwitter,
	SiTypescript,
	SiVisualstudiocode,
	SiWebpack,
	SiWebstorm,
	SiYarn,
} from 'react-icons/si';
import {LanyardResponse} from 'use-lanyard';
import {hoverClassName} from '../components/card';
import {Spotify} from '../components/spotify';
import matrix from '../images/matrix.gif';
import me from '../images/me.jpg';
import {getMapURL} from '../server/apple-maps';
import {age, daysUntilBirthday, discordId, timeInUK} from '../utils/constants';
import {Discord} from '../components/discord';
import {ContactForm} from '../components/contact-form';

export const revalidate = 60;

export default async function Home() {
	const lanyard = await fetch(`https://api.lanyard.rest/v1/users/${discordId}`).then(
		res => res.json() as Promise<LanyardResponse>,
	);

	if (!lanyard.success) {
		throw new Error('Lanyard API failed');
	}

	const location = lanyard.data.kv.location ?? 'London, UK';

	const map = getMapURL(location);

	return (
		<main className="mx-auto grid max-w-3xl grid-cols-4 gap-6 px-6 pb-40 pt-16 md:grid-cols-6">
			<div className="p-200 col-span-2 flex items-center justify-center overflow-hidden rounded-2xl border border-pink-800 bg-pink-200 dark:border-pink-500 dark:bg-pink-500/20 dark:backdrop-blur-2xl md:col-span-4 md:h-52">
				<div className="flex flex-col items-center space-y-4 py-8 px-6 md:flex-row md:space-y-0 md:space-x-4">
					<Image
						src={me}
						placeholder="blur"
						height={80}
						width={80}
						className="h-20 w-20 rounded-full border border-pink-500 object-cover"
						alt="Photo of me"
					/>

					<div className="space-y-1">
						<h1 className="text-center font-title text-2xl font-bold tracking-tighter text-pink-900 dark:text-pink-300 dark:text-glow-pink-500 sm:text-4xl md:text-left">
							alistair smith
						</h1>

						<p className="text-center text-pink-800 dark:text-pink-300/95 dark:text-glow-pink-500/50 md:text-left">
							{age} y/o full stack TypeScript engineer 🪄
						</p>
					</div>
				</div>
			</div>
			<Link
				href="https://twitter.com/alistaiir"
				target="_blank"
				rel="noopener noreferrer"
				className={clsx(
					'group col-span-2 flex items-center justify-center rounded-2xl bg-sky-500 text-4xl text-white',
					hoverClassName,
				)}
			>
				<span className="transform-gpu transition group-hover:-rotate-[10deg] group-hover:scale-[1.3]">
					<SiTwitter />
				</span>
			</Link>

			<Discord lanyard={lanyard.data} />

			<div className="col-span-2 grid grid-cols-1 gap-6 md:col-span-1">
				<div className="flex items-center justify-center rounded-2xl bg-sky-900 text-white dark:bg-sky-100 dark:text-sky-900">
					<div className="text-center">
						<h2 className="font-title text-2xl glow-sky-200 dark:glow-sky-500">{timeInUK}</h2>
						<p className="text-xs font-light glow-sky-200 dark:glow-sky-500">in the uk</p>
					</div>
				</div>

				<div className="flex items-center justify-center rounded-2xl border  border-indigo-400 bg-indigo-100 text-indigo-500 dark:bg-indigo-900 dark:bg-indigo-900/50 dark:text-indigo-400">
					<div className="text-center">
						<p className="text-xs font-light">
							<span className="font-title text-xl">{daysUntilBirthday}</span> days
							<br />
							until birthday
						</p>
					</div>
				</div>
			</div>
			<Link
				href="https://github.com/alii"
				target="_blank"
				rel="noopener noreferrer"
				className={clsx(
					'group relative col-span-2 flex flex-col justify-between overflow-hidden rounded-2xl text-white md:col-span-3',
					hoverClassName,
				)}
			>
				<span aria-hidden className="pointer-events-none absolute inset-0 -z-20">
					<Image src={matrix} alt="matrix" fill style={{objectFit: 'cover'}} />
					<span className="absolute inset-0 bg-neutral-900/50" />
				</span>

				<span aria-hidden className="px-6 pt-6">
					<span className="flex justify-between">
						<SiGithub className="text-3xl" />
						<HiOutlineExternalLink className="text-xl opacity-50 transition duration-150 group-hover:opacity-100" />
					</span>
				</span>

				<span className="px-6 pb-6">
					<span className="block font-title font-bold">github</span>
					<span className="block text-sm">my open source work &amp; contributions</span>
				</span>
			</Link>

			<Spotify lanyard={lanyard.data} />

			<div className="group relative col-span-2 flex h-full  min-h-[13rem] flex-shrink-0 overflow-hidden rounded-2xl md:col-span-3">
				<Image src={map} className="bg-black" fill alt="Album cover art" style={{objectFit: 'cover'}} />

				<div className="absolute top-1/2 left-1/2 z-10 flex w-full flex-shrink-0 -translate-x-1/2 -translate-y-1/2 flex-col items-center space-y-2">
					<Image
						src={me}
						alt="me again"
						height={60}
						width={60}
						className="h-15 w-15 rounded-full border-2 border-black transition-transform duration-150 group-hover:-rotate-[10deg] group-hover:scale-110"
					/>

					<p className="rounded-full bg-white/10 pl-2.5 pr-3 font-bold text-white/95 backdrop-blur-md">📌 {location}</p>
				</div>
			</div>

			<div className="col-span-2 flex items-center justify-center rounded-2xl bg-fuchsia-700 p-6 text-fuchsia-100">
				<div className="grid w-full grid-cols-4 grid-rows-4 gap-4 [&>svg]:w-full [&>svg]:text-center">
					<SiTypescript size={24} />
					<SiDocker size={24} />
					<SiNextdotjs size={24} />
					<SiRedis size={24} />
					<SiPostgresql size={24} />
					<SiReact size={24} />
					<SiTailwindcss size={24} />
					<SiNodedotjs size={24} />
					<SiGo size={24} />
					<SiJavascript size={24} />
					<SiAmazonaws size={24} />
					<SiWebstorm size={24} />
					<SiWebpack size={24} />
					<SiBabel size={24} />
					<SiYarn size={24} />
					<SiGit size={24} />
					<SiSpotify size={24} />
					<SiMongodb size={24} />
					<SiVisualstudiocode size={24} />
					<SiDiscord size={24} />
				</div>
			</div>

			<div className="col-span-4 space-y-2 rounded-2xl bg-yellow-200 p-6 dark:bg-indigo-800">
				<h2 className="font-title text-xl font-bold">
					hello world <span className="inline dark:hidden">🌻</span>
					<span className="hidden dark:inline">⭐</span>
				</h2>

				<p>
					My name is alistair, I'm a software engineer from the United Kingdom. I've been programming for as long as I
					can remember, and I'm currently spending my time with the wonderful people at{' '}
					<Link className="underline" href="https://hop.io">
						Hop
					</Link>
					.
				</p>

				<p>
					Beyond programming, I'm really interested in music production, and you can often find me spending time messing
					with DJ decks and my Maschine.
				</p>
			</div>

			<div className="col-span-4 space-y-4 rounded-2xl bg-lime-400 p-6 text-black md:col-span-6">
				<ContactForm />
			</div>
		</main>
	);
}
