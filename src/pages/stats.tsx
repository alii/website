import dynamic from 'next/dynamic';
import Link from 'next/link';
import {Layout} from '../components/layout';
import {breadcrumb, sectionTitle} from '../ui';

const Stats = dynamic(() => import('../components/stats').then(mod => mod.Stats), {
	ssr: false,
});

export default function StatsPage() {
	return (
		<Layout>
			<div className={breadcrumb}>
				<Link href="/">home</Link>
				<span className="text-zinc-400 dark:text-zinc-600">&rsaquo;</span>
				<span>stats</span>
			</div>

			<p className={sectionTitle}>visitor stats (stored locally in your browser)</p>
			<Stats />
		</Layout>
	);
}
