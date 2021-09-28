import Image from 'next/image';
import Link from 'next/link';
import {T} from '../i18n/translator';

export default function AboutPage() {
	return (
		<div className="space-y-8">
			<h1 className="text-3xl block sm:text-4xl md:text-6xl font-bold">
				About
			</h1>
			<div className="text-opacity-20 text-white hover:text-opacity-100 transition-all">
				<Image
					src="/banner.jpg"
					width={1000}
					height={400}
					className="rounded-xl block border-2 object-cover border-white"
				/>
				<span className="text-sm">
					<T phrase="a trip to london with some friends" />
				</span>
			</div>
			<p className="opacity-80">
				Yo! I'm a full-stack engineer from the United Kingdom. I care about
				performant, accessible code. I'm a huge fan of making, reading and
				contributing to open source &amp; you can{' '}
				<a
					href="https://github.com/sponsors/alii"
					rel="noreferrer"
					target="_blank"
				>
					sponsor me on GitHub
				</a>
				. Programming since seven, I've learned a lot about programming
				principles, scaling, and systems architecture. I always love to joke
				around and I take my{' '}
				<a href="https://twitter.com/alistaiiiir">Twitter</a> presence very
				seriously... At the moment, I'm picking up Java with some friends, and
				really loving it. Watch this space?
			</p>
			<p className="opacity-80">
				I'm not 100% sure what to put on this page, I've not properly considered
				it much. If you have any ideas, please{' '}
				<Link href="/talk">let me know</Link>...
			</p>
		</div>
	);
}
