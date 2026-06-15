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
		'When you write `import x from "y"`, what part of the system actually turns "y" into a file? It is split across the spec, the engine and the runtime, and not how you would guess.';

	public keywords = [
		'javascript',
		'esm',
		'cjs',
		'module resolution',
		'typescript',
		'node',
		'v8',
		'runtime',
		'spec',
		'package.json',
	];

	public render() {
		return (
			<>
				<h1 className="font-serif italic">WTF, ESM!?</h1>

				<p>
					I{' '}
					<ExternalLink href="https://twitter.com/alistaiir/status/1634274673876783120">
						tweeted a package.json
					</ExternalLink>{' '}
					a while back and said it was the right way to ship a dual ESM/CJS package. It wasn't.
					Working out why it was wrong was more useful than the fix, because it made me understand
					something I'd been hand-waving for years: when you write <code>import x from 'y'</code>,
					what part of the system actually turns <code>'y'</code> into a file?
				</p>

				<p>
					The job is split across three things that mostly don't talk to each other: the language
					spec, the engine, and the runtime. The split is not where I assumed it was.
				</p>

				<h3>Preface</h3>

				<p>
					Thanks to <ExternalLink href="https://twitter.com/atcb">Andrew Branch</ExternalLink>, who
					corrected my tweet and wrote{' '}
					<ExternalLink href="https://twitter.com/atcb/status/1634653474041503744">
						this thread
					</ExternalLink>{' '}
					on his holiday. He works on TypeScript at Microsoft, on auto-imports and modules, so he is
					roughly the worst possible person to be wrong at on this topic. Thank you Andy ⭐💖
				</p>

				<hr />

				<h3>Three things, one import</h3>

				<p>The spec, the engine and the runtime each do a different part of the work:</p>

				<ul>
					<li>the spec (ECMA-262) decides the order things happen in</li>
					<li>the engine (V8, JavaScriptCore, SpiderMonkey) runs that</li>
					<li>
						the runtime (Node, Bun, Deno, the browser) decides what file <code>'y'</code> is
					</li>
				</ul>

				<p>The spec never touches that last one, which is the part everyone assumes it owns.</p>

				<h3>The spec doesn't resolve anything</h3>

				<p>
					Go looking in <ExternalLink href="https://tc39.es/ecma262/">ECMA-262</ExternalLink> for the
					bit that turns <code>'lodash'</code> into a path and you won't find it. The spec models a
					module as a Module Record and describes its lifecycle: parse, link, evaluate. It handles
					the hard ordering problems, like cycles, top-level <code>await</code>, and what happens
					when a module throws while the graph is still linking. That is all timing.
				</p>

				<p>
					The specifier itself is just a string to it. When the spec needs the module behind that
					string, it doesn't resolve it. It calls a host hook, <code>HostLoadImportedModule</code>{' '}
					(older name: <code>HostResolveImportedModule</code>), and leaves it there. "Host" is the
					spec's word for "someone else's problem". So it pins down <em>when</em> a module is needed
					and says nothing about <em>which file</em> it is.
				</p>

				<h3>The engine runs it, but doesn't do the lookup either</h3>

				<p>
					The host isn't quite the engine. V8 (and JSC, and SpiderMonkey) is what implements
					parse/link/evaluate. It builds the records, walks the graph, runs the bytecode, keeps the
					order the spec asks for. The engine owns the timing.
				</p>

				<p>
					It still has no idea what <code>node_modules</code> is, and has never read a package.json.
					It hands resolution back to whoever embeds it: you give{' '}
					<code>Module::InstantiateModule</code> a resolve callback, and V8 calls it every time it
					needs to turn a specifier into a module. The engine does the graph. You do the lookup.
				</p>

				<h3>The runtime is the part that knows about files</h3>

				<p>
					That embedder, the thing that answers "what file is <code>'y'</code>", is the runtime:
					Node, Bun, Deno, the browser. This is where everything you think of as "how imports work"
					actually lives, and none of it is in the language:
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
					<li>on the web, resolving a URL and checking import maps</li>
				</ul>

				<p>
					This is the bit a wrong tweet taught me: <code>exports</code> isn't a JavaScript feature,
					it's a Node feature. Node invented it for its own resolver and other runtimes copied it.
					When people say ESM vs CJS is a mess, they mean the runtime resolution layer is a mess,
					because it's the only layer carrying both worlds at once.
				</p>

				<h3>Where I went wrong</h3>

				<p>So, the tweet. Roughly this:</p>

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
					One root <code>types</code> for both builds. Looks fine. But <code>exports</code> is a
					resolver, and every consumer (TypeScript included) reads the conditions top to bottom and
					takes the first one that matches. A single root <code>types</code> doesn't tell a{' '}
					<code>require</code> consumer anything useful. You want the types chosen per condition:
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
					First match wins, so <code>types</code> goes first in each block and <code>default</code>{' '}
					goes last. Put <code>import</code> or <code>require</code> above <code>types</code> and the
					consumer resolves straight to the <code>.js</code> and never sees the types.
				</Note>

				<h3>Why two .d.ts files</h3>

				<p>
					This one catches everyone, docs included. A <code>.d.ts</code> describes the shape{' '}
					<em>and</em> the module format of the file next to it. An ESM <code>.d.ts</code> describes{' '}
					<code>export default</code>; a CJS <code>.d.cts</code> describes <code>module.exports</code>
					{' / '}
					<code>export =</code>. They aren't interchangeable. Our package.json says{' '}
					<code>"type": "module"</code>, so a plain <code>.d.ts</code> is ESM and a{' '}
					<code>.d.cts</code> is CJS, same rule as <code>.js</code> vs <code>.cjs</code>. Point your{' '}
					<code>require</code> consumers at the ESM <code>.d.ts</code> and their compiler thinks the
					CJS build has a default export it doesn't. So you copy the file, rename it{' '}
					<code>.d.cts</code>, and point <code>require</code> at it. Yes, it's annoying.
				</p>

				<h3>TypeScript is doing the runtime's job, early</h3>

				<p>
					The thing that made this click: TypeScript is running the runtime's resolver statically. It
					never executes your code, but to check <code>import x from 'y'</code> it has to predict the
					file the runtime will land on, so it reimplements resolution at build time. That's what{' '}
					<code>moduleResolution</code> picks. <code>node16</code> and <code>nodenext</code> copy
					Node's <code>exports</code>-aware resolver, <code>bundler</code> copies what esbuild and
					Vite do, and the old <code>node10</code> (renamed from <code>node</code> in TS 5.0) predates{' '}
					<code>exports</code> and ignores it. That's also why you keep a root <code>main</code> and{' '}
					<code>types</code>: they're the fallback for anything still on <code>node10</code>. If
					TypeScript's guess and the runtime disagree, your types are wrong and you find out when
					someone else does.
				</p>

				<h3>Don't do it by hand</h3>

				<p>
					Stop reading your package.json by eye and let a tool do it.{' '}
					<ExternalLink href="https://arethetypeswrong.github.io/">
						Are the types wrong?
					</ExternalLink>{' '}
					(<code>@arethetypeswrong/cli</code>, aka <code>attw</code>, also Andrew's) runs your package
					through every resolution mode and tells you which consumers break. For the build itself, let{' '}
					<ExternalLink href="https://github.com/isaacs/tshy">tshy</ExternalLink>,{' '}
					<ExternalLink href="https://tsup.egoist.dev/">tsup</ExternalLink> or{' '}
					<ExternalLink href="https://bun.com">Bun</ExternalLink> emit the <code>.js</code>/
					<code>.cjs</code> pair, the matching <code>.d.ts</code>/<code>.d.cts</code> and the{' '}
					<code>exports</code> block. I haven't hand-written this object since.
				</p>

				<h3>tl;dr</h3>

				<ul>
					<li>the spec owns timing and treats specifiers as opaque strings</li>
					<li>the engine runs the spec and asks a callback for resolution</li>
					<li>
						the runtime does the resolution (node_modules, package.json, <code>exports</code>);{' '}
						<code>exports</code> is Node's, not JavaScript's
					</li>
					<li>
						TypeScript reimplements the runtime's resolver statically; <code>moduleResolution</code>{' '}
						picks which one
					</li>
					<li>
						inside <code>exports</code>: first match wins, <code>types</code> first,{' '}
						<code>default</code> last, ship <code>.d.ts</code> + <code>.d.cts</code>, run{' '}
						<code>attw</code>
					</li>
				</ul>

				<p>
					The tweet was wrong, but the thing I actually needed wasn't a better package.json. It was
					knowing the runtime owns the lookup and the spec doesn't. Once that's clear, the rest mostly
					falls out.
				</p>
			</>
		);
	}
}
