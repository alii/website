import Link from 'next/link';
import {tag as tagClass} from '../ui';
import {tagCounts} from '../utils/tags';

const tags = tagCounts();

export function TagCloud() {
	return (
		<div className="flex flex-wrap gap-1.5">
			{tags.map(({tag, count}) => (
				<Link className={tagClass} key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`}>
					{tag}
					<span className="ml-1 border-l border-sky-700/30 pl-1 text-[10px] text-sky-600/80 dark:border-sky-400/30 dark:text-sky-400/70">
						{count}
					</span>
				</Link>
			))}
		</div>
	);
}
