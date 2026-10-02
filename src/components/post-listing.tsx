import type {Post} from '../blog/Post';
import {listing, muted, thing} from '../ui';

const fmt = new Intl.DateTimeFormat('en-GB', {
	month: 'short',
	year: 'numeric',
	timeZone: 'UTC',
});

export function PostListing({posts}: {posts: readonly Post[]}) {
	return (
		<ol className={listing}>
			{posts.map(post => (
				<li className={thing} key={post.slug}>
					<a href={`/${post.slug}`}>{post.name}</a>{' '}
					<span className={muted} suppressHydrationWarning>
						&middot; {fmt.format(post.date)}
					</span>
				</li>
			))}
		</ol>
	);
}
