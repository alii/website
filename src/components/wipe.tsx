'use client';

import {useState} from 'react';
import {useIsomorphicLayoutEffect} from '../hooks/layout';
import {stripIndent} from 'common-tags';

export function Wipe() {
	const [hidden, setHidden] = useState(true);

	useIsomorphicLayoutEffect(() => {
		const timer = setTimeout(() => {
			setHidden(false);
		}, 150);

		return () => clearTimeout(timer);
	}, []);

	return (
		<div
			aria-hidden
			className="bg-grid shadow-2x fixed inset-0 z-20 flex items-center justify-center bg-neutral-200 transition-all duration-1000 will-change-[clip-path] dark:bg-indigo-900"
			style={{
				clipPath: hidden ? 'circle(90.0% at 50% 50%)' : 'circle(0.0% at 50% 50%)',
				transform: hidden ? 'scale(1)' : 'scale(2)',
			}}
		>
			<pre>
				{stripIndent`
	 		        \\(")/
					-( )-
					/(_)\\
				`}
			</pre>
		</div>
	);
}
