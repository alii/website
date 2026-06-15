import Link from 'next/link';
import {Layout} from '../../components/layout';
import {box, boxBd, boxHd, breadcrumb, listing, thing, thingEntry, thingExcerpt, thingTitle} from '../../ui';

const experiments = [
	{
		href: '/experiments/morphing-shapes',
		name: 'Morphing Shapes',
		desc: 'Animating and shifting divs using just CSS transitions and JS to initiate them.',
	},
	{
		href: '/monzo/dashboard',
		name: 'Monzo Dashboard',
		desc: 'Using the Monzo API to display personal account details. The Monzo API requires me to manually add users, so contact me if you want access.',
	},
	{
		href: '/experiments/rekordbox-history-parser',
		name: 'Rekordbox History Parser',
		desc: 'Rekordbox exports history in a format not so useful for copy pasting. This is a tiny tool to fix that.',
	},
];

export default function ExperimentsList() {
	return (
		<Layout>
			<div className={breadcrumb}>
				<Link href="/">home</Link>
				<span className="text-zinc-400 dark:text-zinc-600">&rsaquo;</span>
				<span>experiments</span>
			</div>

			<section className={box}>
				<div className={boxHd}>experiments</div>
				<div className={boxBd}>
					<p>
						A list of random experiments I&apos;ve built on this website. There&apos;s not a lot
						here and most of it is quite old.
					</p>
				</div>
			</section>

			<ol className={listing}>
				{experiments.map(experiment => (
					<li className={thing} key={experiment.href}>
						<div className={thingEntry}>
							<Link className={thingTitle} href={experiment.href}>
								{experiment.name}
							</Link>
							<p className={thingExcerpt}>{experiment.desc}</p>
						</div>
					</li>
				))}
			</ol>
		</Layout>
	);
}
