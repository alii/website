import clsx from 'clsx';
import Link from 'next/link';
import {useEffect, useState} from 'react';
import type {Post} from '../blog/Post';
import {
	arrow,
	listing,
	tag as tagClass,
	thing,
	thingEntry,
	thingExcerpt,
	thingScore,
	thingTagline,
	thingTitle,
	thingVote,
} from '../ui';
import {normalizeTag} from '../utils/tags';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Deterministic so server and client render identically (no hydration drift).
function fmtDate(date: Date) {
	return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

type Vote = -1 | 0 | 1;

/**
 * Real voting. The `count` is the global tally from Lanyard KV (live over the
 * websocket); the user's own up/down choice is remembered in localStorage so
 * the arrows highlight and a second click retracts. Clicking POSTs the delta to
 * /api/vote, which writes KV; the new global count then arrives back over the
 * socket and reconciles our optimistic guess.
 */
function VoteBox({slug, count}: {slug: string; count: number}) {
	const [vote, setVote] = useState<Vote>(0);
	const [optimistic, setOptimistic] = useState(count);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		try {
			const stored = localStorage.getItem(`vote:${slug}`);
			if (stored === '1' || stored === '-1') {
				setVote(Number(stored) as Vote);
			}
		} catch {
			/* ignore */
		}
	}, [slug]);

	useEffect(() => {
		setOptimistic(count);
	}, [count]);

	const cast = (next: Exclude<Vote, 0>) => {
		setVote(prev => {
			const value: Vote = prev === next ? 0 : next;
			const delta = value - prev;

			if (delta !== 0) {
				setOptimistic(current => Math.max(0, current + delta));

				try {
					if (value === 0) {
						localStorage.removeItem(`vote:${slug}`);
					} else {
						localStorage.setItem(`vote:${slug}`, String(value));
					}
				} catch {
					/* ignore */
				}

				void fetch('/api/vote', {
					method: 'POST',
					headers: {'Content-Type': 'application/json'},
					body: JSON.stringify({slug, delta}),
				}).catch(() => {
					/* best effort; the socket is the source of truth */
				});
			}

			return value;
		});
	};

	return (
		<div className={thingVote}>
			<button
				type="button"
				className={clsx(arrow, mounted && vote === 1 && '!text-[#f48024]')}
				onClick={() => cast(1)}
				aria-label="upvote"
				aria-pressed={vote === 1}
			>
				&#9650;
			</button>
			<span className={thingScore}>{mounted ? optimistic : count}</span>
			<button
				type="button"
				className={clsx(
					arrow,
					'hover:!text-[#6a92ff]',
					mounted && vote === -1 && '!text-[#6a92ff]',
				)}
				onClick={() => cast(-1)}
				aria-label="downvote"
				aria-pressed={vote === -1}
			>
				&#9660;
			</button>
		</div>
	);
}

export interface PostListingPost {
	name: string;
	slug: string;
	excerpt: string;
	date: Date;
	keywords?: string[];
}

function toListingPost(post: Post | PostListingPost): PostListingPost {
	const base: PostListingPost = {
		name: post.name,
		slug: post.slug,
		excerpt: post.excerpt,
		date: post.date,
	};

	if ('keywords' in post && post.keywords) {
		base.keywords = post.keywords;
	}

	return base;
}

export function PostListing({
	posts,
	votes,
}: {
	posts: Array<Post | PostListingPost>;
	votes?: Record<string, number>;
}) {
	const items = posts.map(toListingPost);

	return (
		<ol className={listing}>
			{items.map(post => (
				<li className={thing} key={post.slug}>
					<VoteBox slug={post.slug} count={votes?.[post.slug] ?? 0} />

					<div className={thingEntry}>
						<a className={thingTitle} href={`/${post.slug}`}>
							{post.name}
						</a>

						<p className={thingExcerpt}>{post.excerpt}</p>

						<p className={thingTagline}>
							<span className="text-lime-700 dark:text-lime-500">posted by alii</span>
							<span className="text-zinc-400 dark:text-zinc-600">&middot;</span>
							{fmtDate(post.date)}
							{post.keywords && post.keywords.length > 0 && (
								<>
									<span className="text-zinc-400 dark:text-zinc-600">&middot;</span>
									{post.keywords.slice(0, 4).map(keyword => {
										const t = normalizeTag(keyword);
										return (
											<Link className={tagClass} key={t} href={`/blog?tag=${encodeURIComponent(t)}`}>
												{t}
											</Link>
										);
									})}
								</>
							)}
						</p>
					</div>
				</li>
			))}
		</ol>
	);
}
