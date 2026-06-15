import {posts} from '../blog/posts';

// Votes live in Lanyard's KV store, one flat key per post:
//
//   kv["blogvotes_wtf_esm"] = "12"
//
// Lanyard restricts KV keys to [a-zA-Z0-9_] (no dots or hyphens), so the slug
// is sanitised into the key. Values are plain strings, so each count is stored
// as a stringified number under its own key — no shared blob to rewrite, so
// votes on different posts never clobber each other. Reading is free: these
// keys ride along on the presence payload the site already subscribes to.
// Writes happen server side in /api/vote, which holds the Lanyard API key.
export const VOTES_PREFIX = 'blogvotes_';

export function voteKey(slug: string) {
	return VOTES_PREFIX + slug.replace(/[^a-zA-Z0-9_]/g, '_');
}

export function parseVotes(
	kv: Record<string, string | undefined> | undefined | null,
): Record<string, number> {
	const out: Record<string, number> = {};

	if (!kv) {
		return out;
	}

	// Map each known post back to its (sanitised) key, since the sanitisation
	// isn't reversible — we look up by slug rather than scanning kv keys.
	for (const post of posts) {
		const count = Number(kv[voteKey(post.slug)]);

		if (Number.isFinite(count)) {
			out[post.slug] = count;
		}
	}

	return out;
}
