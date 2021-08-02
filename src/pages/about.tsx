import {toWords} from 'number-to-words';
import React, {ReactNode} from 'react';
import day from 'dayjs';
import Link from 'next/link';
import {Layout} from '../layouts/Layout';
import {Activity} from '../components/activity';
import {SiDiscord, SiGithub, SiGmail, SiInstagram, SiMonzo, SiTwitch, SiTwitter} from 'react-icons/si';
import Image from 'next/image';

const birthday = day('2 November 2004').toDate();
const age = Math.abs(new Date(Date.now() - birthday.getTime()).getUTCFullYear() - 1970);

export default function About() {
	return (
		<Layout extraClassNames="bg-black bg-opacity-80">
			<div className="glass h-page overflow-x-hidden overflow-y-auto p-5 h-full sm:h-auto w-full md:w-96 space-y-2 max-h-screen">
				<Link href="/">
					<a className="text-gray-400 hover:text-gray-200">Back</a>
				</Link>
				<div className="flex items-center space-x-3">
					<Image src="/me.png" height={32} width={32} alt="Me" className="h-8 rounded-full" />
					<h1 className="text-3xl font-bold title">Alistair Smith</h1>
				</div>
				<p className="text-gray-400">
					Yo! I'm a {toWords(age)} year old full-stack TypeScript engineer from the United Kingdom. I care about performant,
					accessible code. I'm a huge fan of open source &amp; you can{' '}
					<a href="https://github.com/sponsors/alii">sponsor me on GitHub</a>. Programming since seven, I've learned a lot about
					programming principles, scaling, and systems architecture. I always love to joke around and I take my{' '}
					<a href="https://twitter.com/aabbccsmith">Twitter</a> presence <i>very seriously</i>... At the moment, I'm picking up
					Java with some friends, and really loving it. Watch this space?
				</p>
				<div className="flex items-center">
					<div className="grid grid-cols-2">
						<ContactLink icon={<SiDiscord />} text="alistair#9999" href="https://discord.com/users/268798547439255572/" />
						<ContactLink icon={<SiGmail />} text="inbox@alistair.cloud" href="mailto:inbox@alistair.cloud" />
						<ContactLink icon={<SiGithub />} text="alii" href="https://github.com/alii" />
						<ContactLink icon={<SiMonzo />} text="as" href="https://alistair.cash" />
						<ContactLink icon={<SiInstagram />} text="alistaor" href="https://instagr.am/alistaor" />
						<ContactLink icon={<SiTwitter />} text="@aabbccsmith" href="https://twitter.com/aabbccsmith" />
						<ContactLink icon={<SiTwitch />} text="aabbccsmith" href="https://twitch.tv/aabbccsmith" />
					</div>
				</div>
				<Activity />
			</div>
		</Layout>
	);
}

function ContactLink(props: {icon: ReactNode; text: string; href: string}) {
	return (
		<a href={props.href} className="flex items-center space-x-3" target="_blank" rel="noopener noreferrer">
			<span>{props.icon}</span> <span>{props.text}</span>
		</a>
	);
}
