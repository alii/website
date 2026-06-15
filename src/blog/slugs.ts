// Lightweight list of post slugs, kept separate from posts.ts on purpose:
// importing posts.ts pulls in every blog component (and the syntax highlighter),
// which must NOT end up in server bundles like /api/vote. Keep this in sync with
// the slugs declared on the Post classes.
export const POST_SLUGS = [
	'ambient-declarations',
	'wtf-esm',
	'open-source',
	'mochip',
	'zero-kb-nextjs-blog',
	'serverless-discord-oauth',
	'strict-tsconfig',
] as const;
