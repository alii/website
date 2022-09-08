import type {ReactNode} from 'react';

type DetailProps = {
	details: Array<{name: string; value: ReactNode}>;
};

export function Details(props: DetailProps) {
	return (
		<dl className="space-y-1.5">
			{props.details.map(detail => (
				<div key={detail.name} className="flex">
					<dt className="basis-1/5 font-sans text-sm font-bold uppercase text-neutral-600 dark:text-neutral-500">
						{detail.name}
					</dt>

					<dd className="basis-3/4 font-mono text-sm text-neutral-500 dark:text-neutral-300">
						{detail.value}
					</dd>
				</div>
			))}
		</dl>
	);
}
