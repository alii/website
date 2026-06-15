import {useMemo} from 'react';
import {box, boxBd, boxHd, pinrow, pinrowK} from '../ui';
import {useFirstEverLoad, useVisitCounts} from '../hooks/use-first-ever-load';

export function Stats() {
	const [stats] = useFirstEverLoad();
	const [visits] = useVisitCounts();

	const firstEverLoadTime = useMemo(() => new Date(stats.time), [stats.time]);

	return (
		<section className={box}>
			<div className={boxHd}>your visitor record</div>
			<div className={boxBd}>
				<div className={pinrow}>
					<span className={pinrowK}>first seen</span>
					<span className="min-w-0 flex-1">
						{firstEverLoadTime.toLocaleDateString()} at {firstEverLoadTime.toLocaleTimeString()}
					</span>
				</div>
				<div className={pinrow}>
					<span className={pinrowK}>landed on</span>
					<span className="min-w-0 flex-1 font-mono">{stats.path}</span>
				</div>
				<div className={pinrow}>
					<span className={pinrowK}>visits</span>
					<span className="min-w-0 flex-1">
						{visits} total &mdash; {visits - 1} return visit{visits - 1 === 1 ? '' : 's'}.{' '}
						{visits > 1 && 'Thanks for coming back!'}
					</span>
				</div>
			</div>
		</section>
	);
}
