import type {Post} from '../blog/Post';
import {listing, muted, thing} from '../ui';

const fmt = new Intl.DateTimeFormat('en-GB', {
	month: 'short',
	year: 'numeric',
});

export interface PostListingPost {
	name: string;
	slug: string;
	date: Date;
}

export function PostListing({posts}: {posts: Array<Post | PostListingPost>}) {
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
