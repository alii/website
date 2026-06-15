import {NextkitError} from 'nextkit';
import {z} from 'zod';
import {posts} from '../../blog/posts';
import {api} from '../../server/api';
import {env} from '../../server/env';
import {discordId} from '../../utils/constants';
import {voteKey} from '../../utils/votes';

const slugs = new Set(posts.map(post => post.slug));

const schema = z.object({
	slug: z.string().refine(slug => slugs.has(slug), 'Unknown post'),
	// -2..2 covers flipping straight from a downvote to an upvote (and back).
	delta: z
		.number()
		.int()
		.refine(delta => delta !== 0 && delta >= -2 && delta <= 2, 'Invalid delta'),
});

export default api({
	async POST({req, ctx}) {
		if (!env.LANYARD_API_KEY) {
			throw new NextkitError(503, 'Voting is not configured');
		}

		const {slug, delta} = schema.parse(req.body);
		const key = voteKey(slug);

		// Read-modify-write of this post's single key. Not atomic, but fine for a
		// personal blog's traffic, and votes on different posts no longer collide.
		const presence = await ctx.lanyard.get();
		const current = Number(presence.kv[key]);
		const base = Number.isFinite(current) ? current : 0;
		const next = Math.max(0, base + delta);

		const result = await fetch(
			`https://api.lanyard.rest/v1/users/${discordId}/kv/${encodeURIComponent(key)}`,
			{
				method: 'PUT',
				headers: {
					'Authorization': env.LANYARD_API_KEY,
					'Content-Type': 'text/plain',
				},
				body: String(next),
			},
		);

		if (!result.ok) {
			throw new NextkitError(502, 'Failed to persist vote');
		}

		return {slug, count: next};
	},
});
