import dynamic from 'next/dynamic';

const Stats = dynamic(() => import('../components/stats').then(mod => mod.Stats), {
	ssr: false,
});

export default function StatsPage() {
	return <Stats />;
}
