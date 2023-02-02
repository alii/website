import {SiTwitter, SiDiscord, SiGithub} from 'react-icons/si';
import Image from 'next/image';
import me from '../images/me.jpg';
import Link from 'next/link';
import {LanyardResponse} from 'use-lanyard';
import clsx from 'clsx';

const UKTimeFormatter = new Intl.DateTimeFormat(undefined, {
	timeZone: 'Europe/London',
	hour: 'numeric',
	minute: 'numeric',
	hour12: false,
});

const RelativeTimeFormatter = new Intl.RelativeTimeFormat('en', {
	style: 'long',
});

const discordId = '268798547439255572';
const timeInUK = UKTimeFormatter.format(new Date());
const dob = new Date('2004-11-02');
const age = new Date(Date.now() - dob.getTime()).getUTCFullYear() - 1970;
const hasHadBirthdayThisYear = new Date().getMonth() >= dob.getMonth() && new Date().getDate() >= dob.getDate();
const nextBirthdayYear = new Date().getFullYear() + (hasHadBirthdayThisYear ? 1 : 0);
const daysUntilBirthday = RelativeTimeFormatter.formatToParts(
	Math.floor(
		(new Date(nextBirthdayYear, dob.getMonth(), dob.getDay() + 1).getTime() - Date.now()) / 1000 / 60 / 60 / 24,
	),
	'day',
)[1]!.value.toString();

export const revalidate = 10;

const statusMap = {
	online: 'bg-green-500 text-white hover:bg-green-600',
	idle: 'bg-orange-400 text-white hover:bg-orange-500',
	dnd: 'bg-red-500 text-white hover:bg-red-600',
	offline: 'bg-blurple text-white hover:bg-blurple-600',
};

export default async function Home() {
	const lanyard = await fetch(`https://api.lanyard.rest/v1/users/${discordId}`).then(
		res => res.json() as Promise<LanyardResponse>,
	);

	if (!lanyard.success) {
		return null;
	}

	return (
		<main className="mx-auto grid max-w-3xl grid-cols-4 gap-6 py-16 px-6 md:grid-cols-6">
			<div className="p-200 col-span-2 flex items-center justify-center overflow-hidden rounded-2xl bg-neutral-200 dark:bg-neutral-800 md:col-span-4 md:h-52">
				<div className="flex flex-col items-center space-y-4 py-8 px-6 md:flex-row md:space-y-0 md:space-x-4">
					<Image
						src={me}
						placeholder="blur"
						height={80}
						width={80}
						className="w-2- h-20 rounded-full object-cover"
						alt="Photo of me posing"
					/>

					<div className="space-y-1 text-neutral-600 dark:text-neutral-300">
						<h1 className="text-center font-title text-2xl font-bold sm:text-4xl">
							i'm alistair<span className="ml-3 hidden md:inline-block">👋</span>
						</h1>

						<p className="text-center md:text-left">{age} y/o full stack typescript engineer</p>
					</div>
				</div>
			</div>

			<Link
				href="https://twitter.com/alistaiir"
				target="_blank"
				rel="noopener noreferrer"
				className="group col-span-2 flex items-center justify-center rounded-2xl bg-sky-500 text-4xl text-white shadow-lg shadow-sky-500/50 transition-colors hover:bg-sky-600 dark:shadow-sky-900"
			>
				<span className="transform-gpu transition group-hover:-rotate-[10deg] group-hover:scale-[1.3]">
					<SiTwitter />
				</span>
			</Link>

			<Link
				href="https://twitter.com/alistaiir"
				target="_blank"
				rel="noopener noreferrer"
				className={clsx(
					'group col-span-2 flex h-52 items-center justify-center rounded-2xl text-4xl transition-colors',
					statusMap[lanyard.data.discord_status ?? 'offline'],
				)}
			>
				<span className="transform-gpu transition group-hover:-rotate-[10deg] group-hover:scale-[1.3]">
					<SiDiscord />
				</span>
			</Link>

			<div className="grid grid-cols-1 gap-6">
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

			<div className="col-span-3 flex flex-col justify-between rounded-2xl bg-black text-white dark:bg-neutral-100 dark:text-neutral-800">
				<div className="pl-6 pt-6">
					<SiGithub className="text-3xl" />
				</div>

				<div className="px-6 pb-6">
					<h2 className="font-title font-bold">GitHub</h2>
					<p className="text-sm">my open source work &amp; contributions</p>
				</div>
			</div>
		</main>
	);
}
