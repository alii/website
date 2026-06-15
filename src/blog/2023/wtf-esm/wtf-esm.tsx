import {stripIndent} from 'common-tags';
import {ExternalLink} from '../../../components/external-link';
import {Note} from '../../../components/note';
import {Highlighter} from '../../../components/syntax-highligher';
import {Post} from '../../Post';

export class WTFESM extends Post {
	public name = 'WTF, ESM!?';
	public slug = 'wtf-esm';
	public date = new Date('2023-04-03');
	public hidden = true;
	public excerpt =
		'I got confidently wrong about publishing a package, in public, and Andrew Branch corrected me from his holiday. This is the week-long hole that came after, and the question underneath it: who actually turns "y" into a file?';

	public keywords = ['module resolution', 'esm', 'cjs', 'typescript', 'node', 'javascript'];

	public render() {
		return (
			<>
				<h1 className="font-serif italic">WTF, ESM!?</h1>

				<p>
					Here's a reliable way to learn something properly: be confidently wrong about it, in public,
					at scale.
				</p>

				<p>
					Early 2023 I{' '}
					<ExternalLink href="https://twitter.com/alistaiir/status/1634274673876783120">
						posted a package.json on Twitter
					</ExternalLink>{' '}
					— the <code>exports</code> block and the handful of fields around it — with a caption that
					came down to "this is how you ship a dual ESM and CJS package, it's really not that hard."
				</p>

				{/* TODO(alistair): the actual tweet wording + which package/lib this was for makes the opening real */}

				<p>
					It did numbers. Likes, quote-tweets, the little notification dot lighting up again and
					again. For about a day I was The Guy Who Figured Out ESM. Genuinely a nice feeling.
					Recommend it.
				</p>

				<p>Then Andrew Branch replied, and I stopped being that guy.</p>

				<p>
					Context, because it matters. <ExternalLink href="https://twitter.com/atcb">Andrew</ExternalLink>{' '}
					works on TypeScript at Microsoft, on modules and auto-imports specifically. If{' '}
					<code>moduleResolution</code> has ever ruined your afternoon, he is somewhere upstream of
					that, in a good way. There is a real chance he understands Node's resolution algorithm more
					completely than any other living person. He was on holiday. He replied anyway, with{' '}
					<ExternalLink href="https://twitter.com/atcb/status/1634653474041503744">
						a thread
					</ExternalLink>{' '}
					that was somehow both very kind and a complete teardown.
				</p>

				<p>
					What he pointed out looked tiny. I had a single root <code>types</code> field, aiming one{' '}
					<code>.d.ts</code> at both the ESM and the CJS build. That's wrong. And the reason it's
					wrong is not a one-liner. It's a week-long hole, which I'm about to drag you through,
					because it turned out to be the most interesting thing I learned all year.
				</p>

				{/* TODO(alistair): the specific first thing Andrew said, and the moment it actually clicked, would land hard here */}

				<p>
					To see why one <code>.d.ts</code> breaks, you need to know what <code>exports</code>{' '}
					actually is. To know what <code>exports</code> is, you have to answer a question I had
					somehow never asked, after years of writing imports every single day: when I type{' '}
					<code>import x from 'y'</code>, what part of the system turns <code>'y'</code> into a file on
					disk?
				</p>

				<p>
					I'd have guessed "JavaScript does." The language. Some clause in the spec that knows about{' '}
					<code>node_modules</code>. That guess is wrong, and the precise way it's wrong is the whole
					point.
				</p>

				<h3>The spec resolves nothing</h3>

				<p>
					<ExternalLink href="https://tc39.es/ecma262/">ECMA-262</ExternalLink>, the actual
					specification, does not resolve modules. Go and search it for the part that turns{' '}
					<code>'lodash'</code> into a path. It isn't in there.
				</p>

				<p>
					What it does is the hard, abstract part. It models a module as a Module Record and pins down
					the lifecycle every graph goes through: parse, link, evaluate. The ordering modules run in.
					How cycles get resolved. How top-level <code>await</code> suspends a whole graph. What
					happens when something throws while the graph is still linking. That's the genuinely
					difficult stuff, and the spec owns all of it.
				</p>

				<p>
					The specifier, though? Just a string. When the spec needs the module hiding behind that
					string, it does not go looking for it. It calls a host hook —{' '}
					<code>HostLoadImportedModule</code>, or its older synchronous self,{' '}
					<code>HostResolveImportedModule</code> — and stops there. "Host" is spec-speak for "not me,
					ask whoever is running this." It nails down <em>when</em> a module is needed. It says
					nothing about <em>which file</em> that is.
				</p>

				<h3>The engine runs it, and still doesn't do the lookup</h3>

				<p>
					So the host is the engine, right? Not quite. V8 (and JavaScriptCore, and SpiderMonkey) is
					what implements parse/link/evaluate. It builds the records, walks the graph, runs the
					bytecode, keeps the order the spec asked for. The engine owns the timing.
				</p>

				<p>
					But V8 has no concept of a <code>node_modules</code> folder. It has never opened a
					package.json and never will. It pushes resolution back out to whoever embedded it: you hand{' '}
					<code>Module::InstantiateModule</code> a resolve callback, and V8 calls that callback every
					time it has to turn a specifier into a module. The engine does the graph. You do the lookup.
				</p>

				<h3>The runtime is the only part that knows about files</h3>

				<p>
					That embedder — the thing on the other end of the callback, answering "what file is{' '}
					<code>'y'</code>" — is the runtime. Node, Bun, Deno, the browser. Everything you think of as
					"how imports work" lives down here, and not one bit of it is in the language:
				</p>

				<ul>
					<li>
						walking up <code>node_modules</code>
					</li>
					<li>
						reading package.json: <code>main</code>, <code>module</code>, <code>exports</code>,{' '}
						<code>imports</code>
					</li>
					<li>
						matching conditions: <code>import</code>, <code>require</code>, <code>types</code>,{' '}
						<code>node</code>, <code>default</code>
					</li>
					<li>
						trying extensions: <code>.js</code>, <code>.mjs</code>, <code>.cjs</code>,{' '}
						<code>/index.js</code>
					</li>
					<li>on the web, resolving against a URL and consulting import maps</li>
				</ul>

				<p>
					And there's the thing it took a viral wrong tweet to beat into me. <code>exports</code> is
					not a JavaScript feature. It's a Node feature. Node invented it, for Node's own resolver,
					and the other runtimes copied it because what else were they going to do. So when people say
					"ESM vs CJS is a mess," what they're really describing is one specific layer — the runtime's
					resolution layer — being a mess, because it's the only layer on the hook for keeping both
					worlds alive at the same time.
				</p>

				<h3>Back to me being wrong</h3>

				<p>With that in hand, the mistake is easy to name. Here's roughly the shape of what I tweeted:</p>

				<Highlighter language="json">
					{stripIndent`
						{
							"type": "module",
							"main": "./dist/index.cjs",
							"module": "./dist/index.js",
							"types": "./dist/index.d.ts",
							"exports": {
								".": {
									"types": "./dist/index.d.ts",
									"import": "./dist/index.js",
									"require": "./dist/index.cjs"
								},
								"./package.json": "./package.json"
							}
						}
					`}
				</Highlighter>

				<p>
					One <code>types</code> at the root, one <code>.d.ts</code>, both builds. Looks completely
					reasonable. The catch is that <code>exports</code> is a resolver, and every consumer
					(TypeScript very much included) reads those conditions top to bottom and takes the first
					match. A root <code>types</code> tells a <code>require</code> consumer nothing it can use.
					You want the type file picked per condition, like this:
				</p>

				<Highlighter language="json">
					{stripIndent`
						{
							"exports": {
								".": {
									"import": {
										"types": "./dist/index.d.ts",
										"default": "./dist/index.js"
									},
									"require": {
										"types": "./dist/index.d.cts",
										"default": "./dist/index.cjs"
									}
								},
								"./package.json": "./package.json"
							}
						}
					`}
				</Highlighter>

				<Note variant="warning" title="Order matters">
					First match wins. So <code>types</code> goes first in each block and <code>default</code>{' '}
					goes last. Put <code>import</code> or <code>require</code> above <code>types</code> and the
					consumer resolves straight to the <code>.js</code>, never reaches the types, and decides you
					shipped none.
				</Note>

				<h3>Two .d.ts files, because of course</h3>

				<p>
					This is the part that gets everyone, the docs included, and it's the part Andrew had to walk
					me through slowly. A <code>.d.ts</code> describes the shape of a module <em>and</em> its
					format. An ESM <code>.d.ts</code> is describing a file with <code>export default</code>; a
					CJS <code>.d.cts</code> is describing one with <code>module.exports</code> /{' '}
					<code>export =</code>. Different things. Not swappable. Because our package.json says{' '}
					<code>"type": "module"</code>, a bare <code>.d.ts</code> is read as ESM and a{' '}
					<code>.d.cts</code> as CJS, exactly the way <code>.js</code> and <code>.cjs</code> split. So
					if you aim your <code>require</code> consumers at the ESM <code>.d.ts</code>, their compiler
					decides your CommonJS build has a default export that does not exist, and the errors show up
					three repos away in someone else's CI.
				</p>

				<p>
					The fix is exactly as dumb as it sounds: build your <code>.d.ts</code>, copy it, rename the
					copy to <code>.d.cts</code>, point <code>require</code> at the copy. That's it. That's the
					state of the art.
				</p>

				<h3>And TypeScript is doing all of this early</h3>

				<p>
					Here's the bit that finally made the whole thing sit still in my head. TypeScript is running
					the runtime's resolver, statically, before anything executes. It has to. To type-check{' '}
					<code>import x from 'y'</code> it needs to know which file the runtime is going to choose, so
					it reimplements resolution at build time and guesses. <code>moduleResolution</code> is you
					telling it which runtime to imitate: <code>node16</code> and <code>nodenext</code> copy
					Node's <code>exports</code>-aware resolver, <code>bundler</code> copies what esbuild and Vite
					do, and the ancient <code>node10</code> (just <code>node</code>, renamed in TS 5.0) predates{' '}
					<code>exports</code> entirely and ignores it — which, by the way, is the actual reason you
					still keep a root <code>main</code> and <code>types</code> around. They're the fallback for
					everything still resolving like it's 2019. And when TypeScript's guess and the real runtime
					disagree, your types are quietly wrong, and you don't find out. Someone else does.
				</p>

				<h3>Just use a tool</h3>

				<p>
					Do not do any of this by eye. I did, and look where it got me.{' '}
					<ExternalLink href="https://arethetypeswrong.github.io/">Are the types wrong?</ExternalLink>{' '}
					(<code>@arethetypeswrong/cli</code>, or <code>attw</code> — also Andrew's, naturally) runs
					your package through every resolution mode there is and tells you exactly which consumers
					break and why. And for actually producing the dual build, let{' '}
					<ExternalLink href="https://github.com/isaacs/tshy">tshy</ExternalLink>,{' '}
					<ExternalLink href="https://tsup.egoist.dev/">tsup</ExternalLink>, or these days just{' '}
					<ExternalLink href="https://bun.com">Bun</ExternalLink> emit the <code>.js</code>/
					<code>.cjs</code> pair, the matching declarations, and the <code>exports</code> block. I have
					not hand-written that object since, and I'm not going to.
				</p>

				<h3>tl;dr</h3>

				<ul>
					<li>the spec owns timing and treats specifiers as opaque strings</li>
					<li>the engine runs the spec and asks a callback to do the lookup</li>
					<li>
						the runtime does the lookup — <code>node_modules</code>, package.json,{' '}
						<code>exports</code>. <code>exports</code> is Node's, not the language's
					</li>
					<li>
						TypeScript reimplements the runtime's resolver statically; <code>moduleResolution</code>{' '}
						picks which one to copy
					</li>
					<li>
						inside <code>exports</code>: first match wins, <code>types</code> first,{' '}
						<code>default</code> last, ship <code>.d.ts</code> + <code>.d.cts</code>, run{' '}
						<code>attw</code>
					</li>
				</ul>

				<p>
					I left the tweet up. Wrong, with Andrew's reply underneath it doing the teaching. Felt more
					honest than quietly deleting and pretending.
				</p>

				{/* TODO(alistair): what you actually did with the tweet — left it, deleted it, pinned the thread? your real ending */}

				<p>
					The fix was never a better package.json. It was finally getting that the runtime owns the
					lookup and the language washed its hands of it years ago. Everything weird about{' '}
					<code>exports</code> I'd been copy-pasting on faith had a reason the whole time. I just
					hadn't asked who was answering the question.
				</p>
			</>
		);
	}
}
