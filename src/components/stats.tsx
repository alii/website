import {useMemo} from 'react';
import {useFirstEverLoad, useVisitCounts} from '../hooks/use-first-ever-load';

export function Stats() {
	const [stats] = useFirstEverLoad();
	const [visits] = useVisitCounts();

	const firstEverLoadTime = useMemo(() => new Date(stats.time), [stats.time]);

	return (
		<div className="m-4 mx-auto max-w-2xl rounded-md bg-blue-900 p-4 py-12">
			<p>
				You first visited my website on {firstEverLoadTime.toLocaleDateString()} at{' '}
				{firstEverLoadTime.toLocaleTimeString()} and on this first visit, you were on the{' '}
				{stats.path} page. Since then, you have visited {visits - 1} more times.{' '}
				{visits > 1 && 'Thanks for coming back!'}
			</p>
		</div>
	);
}
