import {Mochip} from './2022/01/mochip/mochip';
import {ServerlessDiscordOAuth} from './2022/01/serverless-discord-oauth/serverless-discord-oauth';
import {ZeroKbBlog} from './2022/01/zero-kb-blog/zero-kb-blog';
import {OpenSource} from './2022/03/open-source/open-source';
import {StrictTSConfig} from './2022/08/strict-tsconfig/strict-tsconfig';
import {ESM} from './2023/esm/esm';
import {AmbientDeclarations} from './2025/ambient-declarations/ambient-declarations';
import {GleamBunApps} from './2026/gleam-bun-apps/gleam-bun-apps';
import {Railways} from './2026/railways/railways';

export const posts = [
	new Railways(),
	new GleamBunApps(),
	new AmbientDeclarations(),
	new ESM(),
	new OpenSource(),
	new Mochip(),
	new ZeroKbBlog(),
	new ServerlessDiscordOAuth(),
	new StrictTSConfig(),
] as const;

export function sortPosts(p: typeof posts) {
	return p.toSorted((a, b) => {
		if (a.date > b.date) return -1;
		if (a.date < b.date) return 1;
		return 0;
	});
}
