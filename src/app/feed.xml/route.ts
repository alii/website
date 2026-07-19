import {posts, sortPosts} from '../../blog/posts';
import {escapeHtml} from '../../utils/escape-html';

export const dynamic = 'force-static';

export function GET() {
	const visible = sortPosts(posts).filter(post => !post.hidden);

	const items = visible
		.map(post =>
			[
				'		<item>',
				`			<title>${escapeHtml(post.name)}</title>`,
				`			<link>https://alistair.sh/${post.slug}</link>`,
				`			<guid isPermaLink="true">https://alistair.sh/${post.slug}</guid>`,
				`			<pubDate>${post.date.toUTCString()}</pubDate>`,
				`			<description>${escapeHtml(post.excerpt)}</description>`,
				'		</item>',
			].join('\n'),
		)
		.join('\n');

	const feed = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
		'	<channel>',
		'		<title>Alistair Smith</title>',
		'		<link>https://alistair.sh</link>',
		'		<description>Blog posts by Alistair Smith</description>',
		'		<language>en</language>',
		`		<lastBuildDate>${visible[0]!.date.toUTCString()}</lastBuildDate>`,
		'		<atom:link href="https://alistair.sh/feed.xml" rel="self" type="application/rss+xml"/>',
		items,
		'	</channel>',
		'</rss>',
		'',
	].join('\n');

	return new Response(feed, {
		headers: {'Content-Type': 'application/rss+xml; charset=utf-8'},
	});
}
