// The server side of the site, next to the pages in app/pages. `bun bake` serves the pages first, then
// these routes, then `fetch`.
//
// The API routes are Gleam (src/routes/api), compiled by `gleam build` (see `dev` in package.json).
import {handle as contact} from '../build/dev/javascript/website/routes/api/contact.mjs';
import {get as feed} from '../build/dev/javascript/website/routes/api/feed.mjs';
import {handle as map} from '../build/dev/javascript/website/routes/api/map.mjs';
import {handle as monzoCallback} from '../build/dev/javascript/website/routes/api/monzo_callback.mjs';
import {handle as monzoRedirect} from '../build/dev/javascript/website/routes/api/monzo_redirect.mjs';
import {handle as oauth} from '../build/dev/javascript/website/routes/api/oauth.mjs';
import {handle as ping} from '../build/dev/javascript/website/routes/api/ping.mjs';
import {handle as posts} from '../build/dev/javascript/website/routes/api/posts.mjs';
import * as runtime from '../build/dev/javascript/website/next/runtime.mjs';
import {og} from '../src/routes/og';
import {apiRoute} from '../src/server/api';

const gleam = (handle: unknown) =>
	apiRoute((request, response) => runtime.api(handle, request, response));

const redirect = (destination: string, permanent: boolean) => () =>
	new Response(null, {status: permanent ? 308 : 307, headers: {location: destination}});

export default {
	routes: {
		'/api/contact': gleam(contact),
		'/api/map': gleam(map),
		'/api/oauth': gleam(oauth),
		'/api/oauth/:platform/redirect': gleam(monzoRedirect),
		'/api/oauth/:platform/callback': gleam(monzoCallback),
		'/api/ping': gleam(ping),
		'/api/posts': gleam(posts),
		'/api/og': og,
		'/feed.xml': () => runtime.route(feed),

		// Were the redirects of next.config.mjs.
		'/blog': redirect('/', false),
		'/experiments/*': redirect('/', false),
		'/stats': redirect('/', false),
		'/outro': redirect('https://www.youtube.com/watch?v=HeF11Av9WuU', true),
		'/desu': redirect('https://www.youtube.com/watch?v=HotGxCSas6A', true),
		'/10': redirect('https://youtu.be/G5HcvgepK-I', true),
		'/lulzsec': redirect('https://www.youtube.com/watch?v=DurOYPdXyF4', true),
		'/wheels': redirect('https://www.youtube.com/watch?v=9xRFN2i1cwQ', true),
		'/letterone': redirect('https://hyperfollow.com/alistair6/letter100-3', true),
		'/live-25-01-2024': redirect('https://www.youtube.com/watch?v=OvTy9xYH7LA', true),
		'/live-02-02-2024': redirect('https://youtube.com/watch?v=zEoTeUEElZc', true),
		'/live-04-07-2024': redirect('https://youtube.com/watch?v=-XsKN44b7ho', true),
	},

	// The files of public/, as Next served them. Bake has no folder of static files yet.
	async fetch(request: Request) {
		const {pathname} = new URL(request.url);
		if (!pathname.includes('..')) {
			const file = Bun.file(`${import.meta.dir}/../public${decodeURIComponent(pathname)}`);
			if (await file.exists()) return new Response(file);
		}
		// The 404 page, with status 404, at the URL that was asked for.
		const page = await fetch(new URL('/404', request.url));
		return new Response(page.body, {status: 404, headers: page.headers});
	},
};
