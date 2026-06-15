import {posts} from '../blog/posts';

// Tags across posts are inconsistently cased ("typescript" vs "TypeScript"),
// so we group case-insensitively. The normalised form is also what we use in
// /blog?tag=... URLs.
export function normalizeTag(tag: string): string {
	return tag.trim().toLowerCase();
}

export interface TagCount {
	tag: string; // normalised label
	count: number;
}

export function tagCounts(): TagCount[] {
	const counts = new Map<string, number>();

	for (const post of posts) {
		if (post.hidden) {
			continue;
		}

		// de-dupe within a single post so one post never counts a tag twice
		const seen = new Set<string>();

		for (const keyword of post.keywords) {
			const tag = normalizeTag(keyword);
			if (seen.has(tag)) {
				continue;
			}
			seen.add(tag);
			counts.set(tag, (counts.get(tag) ?? 0) + 1);
		}
	}

	return [...counts.entries()]
		.map(([tag, count]) => ({tag, count}))
		.sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}
