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
//
// This module deliberately imports nothing from ../blog so the /api/vote
// serverless bundle stays tiny and never pulls in the blog components or the
// syntax highlighter.
export const VOTES_PREFIX = 'blogvotes_';

/** The sanitised slug used as the map key and the KV key suffix. */
export function voteSlug(slug: string) {
	return slug.replace(/[^a-zA-Z0-9_]/g, '_');
}

/** Full Lanyard KV key for a post's vote count. */
export function voteKey(slug: string) {
	return VOTES_PREFIX + voteSlug(slug);
}

/**
 * Reads every `blogvotes_*` key out of the presence KV and returns a map keyed
 * by the sanitised slug (i.e. {@link voteSlug}). Look up a post with
 * `votes[voteSlug(post.slug)]`.
 */
export function parseVotes(
	kv: Record<string, string | undefined> | undefined | null,
): Record<string, number> {
	const out: Record<string, number> = {};

	if (!kv) {
		return out;
	}

	for (const [key, value] of Object.entries(kv)) {
		if (!key.startsWith(VOTES_PREFIX)) {
			continue;
		}

		const count = Number(value);

		if (Number.isFinite(count)) {
			out[key.slice(VOTES_PREFIX.length)] = count;
		}
	}

	return out;
}
