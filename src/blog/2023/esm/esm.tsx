import {stripIndent} from 'common-tags';
import {ExternalLink} from '../../../components/external-link';
import {Note} from '../../../components/note';
import {Highlighter} from '../../../components/syntax-highligher';
import {Post} from '../../Post';

export class ESM extends Post {
	public name = 'ESM';
	public slug = 'esm';
	public date = new Date('2023-04-03');
	public hidden = true;
	public excerpt = 'Explaining ESM the easy way because I learnt it the hard way';

	public keywords = ['module resolution', 'esm', 'cjs', 'typescript', 'javascript'];

	public render() {
		return (
			<>
				<p>Module resolution in JavaScript is an extremely difficult topic.</p>

				<p>
					Early 2023 I{' '}
					<ExternalLink href="https://twitter.com/alistaiir/status/1634274673876783120">
						posted a screenshot of a package.json
					</ExternalLink>{' '}
					on Twitter. I captioned it "It is <i>crazy</i> how ALL of this is needed to just publish a
					package in today's JS ecosystem…"
				</p>

				<p>Andrew Branch replied.</p>

				<p>
					<ExternalLink href="https://twitter.com/atcb">Andrew</ExternalLink> works on TypeScript at
					Microsoft, on modules and auto-imports specifically. It's rumoured you can whisper "module
					resolution" three times in a mirror and he will appear. He was on holiday and yet replied
					anyway, with{' '}
					<ExternalLink href="https://twitter.com/atcb/status/1634653474041503744">
						an extremely detailed thread
					</ExternalLink>{' '}
					explaining how module resolution can/should really work. It turns out my tweet was
					actually quite wrong and was based on many misconceptions. I think what I posted was
					roughly the understanding of most of the folks from the JavaScript library/framework
					community, so it wasn't me with my understanding off, it was the industry being
					misaligned.
				</p>

				<p>Anyway, here's the contents of the package.json I posted:</p>

				<Highlighter language="json" filename="package.json">
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
					What Andrew pointered out seemed insignificant, and surprisingly was the thing I was
					actually most confident was correct. I had a single root <code>types</code> field, aiming
					one <code>.d.ts</code> at both the ESM and the CJS build. That's wrong. The reason it's
					wrong is the reason I wanted to write this article.
				</p>

				<p>
					That package.json is trying to be two packages at once: an ESM one and a CommonJS one,
					shipped under a single name. People call this a dual package, and the failure mode has a
					name too — the <em>dual package hazard</em>. If a consumer ever loads both your builds in
					the same process (easy, once some dependency-of-a-dependency pulls in the{' '}
					<code>require</code> version while your app pulls in the <code>import</code> one) they end
					up with two separate copies of your module. Two sets of private state.{' '}
					<code>instanceof</code> stops working across the seam, your singleton isn't single, and
					nobody can work out why. That's the swamp this little file is wading into.
				</p>

				<p>
					Andrew's first reply didn't go near any of that. He zeroed in on the one field I'd have bet
					money on: the root <code>types</code>. One <code>.d.ts</code>, he said, cannot describe
					both builds, because a <code>.d.ts</code> isn't only types — it carries a module{' '}
					<em>format</em>. That sentence is the whole article. It took me an embarrassingly long time
					to feel why it was true, and the moment it clicked was the moment I admitted I didn't
					actually know what happens when I type <code>import</code>.
				</p>

				<p>
					Reading the thread back, my tweet was wrong in more ways than one. Roughly, in order of how
					wrong:
				</p>

				<ul>
					<li>
						I thought all of it was <em>required</em>. Most of it is legacy fallback for resolvers
						that predate <code>exports</code>.
					</li>
					<li>
						I thought <code>exports</code> was a JavaScript feature. It's a Node.js feature that the
						other runtimes copied.
					</li>
					<li>
						I thought a <code>.d.ts</code> was just types, the same in any context. It isn't — it has
						a format, ESM or CJS, baked in.
					</li>
					<li>
						I aimed one root <code>types</code> at both builds, which quietly tells every CommonJS
						consumer that my CJS build has a shape it doesn't have.
					</li>
					<li>
						I blamed "the ecosystem." The mess is real, but it lives in exactly one layer, and I was
						pointing at the whole stack.
					</li>
				</ul>

				<p>
					To see why one <code>.d.ts</code> breaks, you need to know what <code>exports</code>{' '}
					actually is. To know what <code>exports</code> is, you have to answer a question I had
					somehow never asked, after years of writing imports every single day: when I type{' '}
					<code>import x from 'y'</code>, what part of the system turns <code>'y'</code> into a file
					on disk?
				</p>

				<p>
					A reasonable answer to that question is "Well... uhh... JavaScript does..." The language.
					Some clause in the spec that knows where to look for your modules, perhaps that's{' '}
					<code>node_modules</code>. That guess is wrong, and the precise way it's wrong is the
					whole point.
				</p>

				<h3>The spec resolves nothing</h3>

				<p>
					<ExternalLink href="https://tc39.es/ecma262/">ECMA-262</ExternalLink>, the actual
					specification, does not resolve modules. You cannot search for the part that turns{' '}
					<code>'lodash'</code> into a path. It isn't in there.
				</p>

				<p>
					ECMA-262 contains the hard, abstract part. It models a module as a <i>Module Record</i>,{' '}
					and defines the lifecycle every module graph goes through: parse, link, evaluate. The
					ordering modules run in. How cycles get resolved. How top-level <code>await</code>{' '}
					suspends a whole graph. What happens when something throws while the graph is still
					linking.
				</p>

				<p>
					"What are <i>parse</i>, <i>link</i>, and <i>evaluate</i>?" I hear you ask...
				</p>

				<p>
					Two words first, gently, because the phases lean on them. The string you import — the{' '}
					<code>'y'</code> in <code>import x from 'y'</code> — is called a <i>specifier</i>, and it
					turns out to be the only thing the machinery gets to start from. And the thing that
					actually carries out the phases is the <i>engine</i>; for now just picture "the program
					running your JavaScript," and trust that we'll pin down exactly what that means in a minute.
				</p>

				<p>
					With those two in hand: every module goes through the same three phases, in order, exactly
					once.
				</p>

				<ul>
					<li>
						<strong>Parse.</strong> The engine reads the source text and turns it into a{' '}
						<i>Module Record</i>. Because <code>import</code> and <code>export</code> are syntax, not
						function calls, it learns the complete list of your imports and exports right here — by
						reading, without running a single line. This is the whole reason ESM can be statically
						analysed and CommonJS can't: <code>require()</code> is just a function, and it could be
						hiding behind an <code>if</code>.
					</li>
					<li>
						<strong>Link.</strong> The engine takes every specifier it found while parsing and
						resolves each one to another Module Record, recursively, until the whole graph exists.
						Then it wires up the bindings, so an imported name points at the <em>live variable</em>{' '}
						in the module that exported it, not a copy. Still nothing has run. This is also where
						import cycles get reconciled — <code>a</code> and <code>b</code> can import each other
						because the bindings are created before any code evaluates.
					</li>
					<li>
						<strong>Evaluate.</strong> Now the engine runs each module body, in dependency order,
						once. Top-level <code>await</code> suspends the graph here. If something throws, the
						graph is already linked, so you get a half-<em>run</em> module rather than a half-
						<em>built</em> one.
					</li>
				</ul>

				<p>
					Notice where the file lookup lives. It's in <strong>link</strong> — "resolve each specifier
					to another Module Record." That is the step that has to turn <code>'y'</code> into a file.
					And it is the exact step the spec quietly refuses to do itself.
				</p>

				<p>
					When the spec reaches that step and needs the module hiding behind the specifier, it does
					not go looking for it. It calls a host hook -{' '}
					<code>HostLoadImportedModule</code>, or its older synchronous self,{' '}
					<code>HostResolveImportedModule</code> - and stops there. "Host" is spec-speak for "not
					me, ask whoever is running this." It nails down <em>when</em> a module is needed. It says
					nothing about <em>which file</em> that is.
				</p>

				<p>
					Read that twice, because it's the load-bearing sentence of the whole post: the
					specification — the document everyone cites as the source of truth for JavaScript — gets to{' '}
					<code>import x from 'y'</code>, needs the file behind <code>'y'</code>, and{' '}
					<em>delegates</em>. It has no opinion. The opinion lives one layer down, in whatever the
					spec keeps calling the host. Which leaves exactly one question, the one the spec spends its
					whole length dodging: who <em>is</em> the host? The rest of this post is just answering
					that.
				</p>

				<h3>The engine runs it, and still doesn't do the lookup</h3>

				<p>
					So the host is the engine, right? Not quite. V8 (and JavaScriptCore, and SpiderMonkey) is
					what implements parse/link/evaluate. It builds the records, walks the graph, runs the
					bytecode, keeps the order the spec asked for. The engine owns the timing.
				</p>

				<p>
					It's worth knowing that not all specifiers are equal, because the runtime branches on
					exactly this. A <em>relative</em> specifier (<code>'./util'</code>, <code>'../lib/x'</code>)
					is resolved against the file doing the importing. An <em>absolute</em> one — a full path,
					or a <code>file:</code>/<code>https:</code> URL in a browser — is taken as-is. And a{' '}
					<em>bare</em> specifier (<code>'lodash'</code>, <code>'react'</code>, no dot and no slash to
					anchor it) is the hard one: it names a <em>package</em>, not a location, and turning a
					package name into a file on disk is where the entire mess we're untangling actually lives.
				</p>

				<p>
					But V8 has no concept of a <code>node_modules</code> folder. It has never opened a
					package.json and it never will. It pushes resolution back out to whoever embedded it: you
					hand <code>Module::InstantiateModule</code> a resolve callback, and V8 calls that callback
					every time it has to turn a specifier into a module. The engine does the graph. You do the
					lookup.
				</p>

				<h3>The runtime is the only part that knows about files</h3>

				<p>
					That embedder - the thing on the other end of the callback, answering "what file is{' '}
					<code>'y'</code>" - is the runtime, and it's the <em>host</em> the spec kept pointing at the
					whole time. Well known runtimes are Bun, Node, Deno, and a browser, like the one you're
					reading this in now. Each one wraps an engine: Node embeds V8, Bun embeds JavaScriptCore,
					your browser embeds whichever engine ships with it. That's the boundary, finally drawn — the
					engine runs your code, and the runtime around it decides what your code even is: where{' '}
					<code>'y'</code> lives, whether <code>node_modules</code> is even a concept. Generally the
					surface most JavaScript engineers think of as "how imports work" lives here in the runtime,
					and the parse/link/evaluate lifecycle in the engine is sort of an opaque &amp; unnecessary
					detail that we are lucky we don't need to worry about.
				</p>

				<p>How does Bun or Node.js resolve my 1kb ai slop JavaScript library then?</p>

				<p>
					Bun &amp; Node.js (&amp; more) implement Node.js' module resolution algorithm. This is not
					really defined in any spec, and has been known to change between Node.js majors. Roughly,
					for a bare specifier, it goes like this:
				</p>

				<ul>
					<li>
						walk up the directory tree looking inside each <code>node_modules</code> until a folder
						matching the package name turns up
					</li>
					<li>
						read that package's <code>package.json</code>
					</li>
					<li>
						if it has an <code>exports</code> field, <em>that field decides everything</em> — it's
						matched against the conditions in play (<code>import</code> vs <code>require</code>,{' '}
						<code>types</code>, <code>node</code>, <code>browser</code>, <code>default</code>), first
						match wins, and anything not listed is simply not reachable
					</li>
					<li>
						if there's no <code>exports</code>, fall back to the old way: the <code>main</code> field,
						then guessing extensions (<code>.js</code>, <code>.mjs</code>, <code>.cjs</code>) and{' '}
						<code>/index.js</code>
					</li>
					<li>
						on the web there's no <code>node_modules</code> at all — specifiers resolve against a
						URL, and bare ones only work if an import map spells them out
					</li>
				</ul>

				<Note variant="info" title="exports is a door, not a hint">
					The thing that trips people up: when <code>exports</code> is present it doesn't <em>add</em>{' '}
					to the old extension-guessing, it <em>replaces</em> it. Files you don't list stop existing
					as far as the resolver is concerned, even when they're right there on disk. That's the
					feature — it's how a package finally gets to control its own public surface — but it's a
					sharp edge if you're used to reaching into <code>some-pkg/lib/internal.js</code>.
				</Note>

				<p>
					And so, finally, this is the thing it took a wrong tweet to beat into me.{' '}
					<code>exports</code> is not a JavaScript feature. It's a Node.js feature. Node.js invented
					it, for Node.js' own resolver, and the other runtimes copied it... because what else were
					they going to do. So when people say "ESM vs CJS is a mess," what they're really
					describing is one specific layer - the runtime's resolution layer - being a mess, because
					it's the only layer on the hook for keeping both worlds alive at the same time.
				</p>

				<h3>Why this took the whole industry a decade</h3>

				<p>
					None of this was anyone being stupid. It was a contract the spec left blank on purpose, and
					a decade of every layer independently guessing at it.
				</p>

				<p>
					ES2015 standardised modules, but only the half I described up top: the <code>import</code>/
					<code>export</code> syntax and the parse/link/evaluate lifecycle. Resolution and loading
					were handed to the host deliberately, because a browser and a server fundamentally disagree
					about what a module even <em>is</em> — one fetches a URL over the network, the other reads
					a file off a disk. There was no single answer to standardise, so they standardised none.
				</p>

				<p>
					Meanwhile Node had shipped CommonJS back in 2009, and npm had a seven-year,
					several-hundred-thousand-package head start. CommonJS is everything ESM isn't:{' '}
					<code>require()</code> is a plain synchronous function, resolved while the code runs,
					returning whatever object you assigned to <code>module.exports</code>. ESM is static,
					asynchronous, and live-bound. You cannot quietly alias one onto the other, and Node couldn't
					break the millions of packages that already existed. So for years there simply was no agreed
					way to even load an ES module in Node — proposals shipped and were ripped out,{' '}
					<code>.mjs</code> fought <code>"type": "module"</code>, and unflagged ESM didn't really land
					until Node 12–13 around 2019.
				</p>

				<p>
					Because the spec said nothing about resolution, Node had to invent the bridge itself — and
					that's where <code>exports</code> and conditions came from. Because Node invented it rather
					than a standards body, everyone else got to interpret it: webpack, esbuild, Vite, Jest and
					the rest each shipped their <em>own</em> resolver, so the same package could resolve one way
					in Node, another in Vite, and a third in your test runner. TypeScript then had to model all
					of them at once, which is the entire reason <code>moduleResolution</code> is a menu of modes
					instead of a single correct value.
				</p>

				<p>
					Bun had the one advantage nobody in 2015 had: hindsight. It arrived after the dust settled
					and implemented Node's resolution and <code>exports</code> semantics from day one, treating
					CJS/ESM interop as a built-in feature rather than something bolted on a major version at a
					time. That's not Bun being smarter; it's Bun being <em>late</em>, which here was a gift.
				</p>

				<h3>Back to me being wrong</h3>

				<p>
					So how do I fix my Tweet? As a reminder, the problem was that we had a root types field,
					that TypeScript was resolving for both CJS and ESM formats.
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
					goes last. Put <code>import</code> or <code>require</code> above <code>types</code> and
					the consumer resolves straight to the <code>.js</code>, never reaches the types, and
					decides you shipped none.
				</Note>

				<p>
					This is the part that gets everyone, the docs included, and it's the part Andrew had to
					walk me through slowly. A <code>.d.ts</code> describes the contents of a module{' '}
					<em>and</em> its format. An ESM <code>.d.ts</code> is describing a file with the{' '}
					<code>export</code> or <code>import</code> keyword; a CJS <code>.d.cts</code> is
					describing one with <code>module.exports</code> or <code>export =</code>. These are
					different, incompatible things. Because our package.json says{' '}
					<code>"type": "module"</code>, a bare <code>.d.ts</code> is read as ESM and a{' '}
					<code>.d.cts</code> as CJS, exactly the way <code>.js</code> and <code>.cjs</code> split.
					So if you aim your <code>require</code> consumers at the ESM <code>.d.ts</code>, their
					compiler decides your CommonJS build has a default export that doesn't exist.
				</p>

				<p>
					The fix is one declaration file per format: a <code>.d.ts</code> that describes the ESM
					build and a <code>.d.cts</code> that describes the CJS one, each pointed at by its own
					condition. The dumb part is how you get the second file. You build the <code>.d.ts</code>,
					copy it, rename the copy to <code>.d.cts</code>, and point <code>require</code> at it. A
					near-identical copy with a different extension is, genuinely, the state of the art.
				</p>

				<p>
					You'd hope TypeScript would do this step for you, and, politely, it won't. <code>tsc</code>{' '}
					emits one declaration per source file, matching that file's format — there's no "also emit
					a CommonJS copy" flag. So the copy-and-rename ends up in a build script, or you hand the
					whole job to a bundler that special-cases it. For the thing TypeScript is otherwise
					extremely good at, it's a surprising gap.
				</p>

				<p>
					TypeScript is running the runtime's resolver, statically, before anything executes. It has
					to. To type-check <code>import x from 'y'</code> it needs to know which file the runtime
					is going to choose, so it reimplements resolution at build time and guesses.{' '}
					<code>moduleResolution</code> is you telling it which runtime to imitate:{' '}
					<code>node16</code> and <code>nodenext</code> copy Node's <code>exports</code>-aware
					resolver, <code>bundler</code> copies what esbuild and Vite do, and the ancient{' '}
					<code>node10</code> (just <code>node</code>, renamed in TS 5.0) predates{' '}
					<code>exports</code> entirely and ignores it — which, by the way, is the actual reason you
					still keep a root <code>main</code> and <code>types</code> around. They're the fallback
					for everything still resolving like it's 2019. And when TypeScript's guess and the real
					runtime disagree, your types are quietly wrong, and you don't find out. Someone else does.
				</p>

				<h3>Just use a tool</h3>

				<p>
					Try to avoid doing this by eye - I strongly recommend you check out{' '}
					<ExternalLink href="https://arethetypeswrong.github.io/">
						Are the types wrong (ATTW)
					</ExternalLink>
					. It's a project from Andrew, naturally. ATTW runs your package through every resolution
					mode supported in TypeScript, and tells you exactly which consumers break and why. And for
					actually producing the dual build, let{' '}
					<ExternalLink href="https://github.com/isaacs/tshy">tshy</ExternalLink>,{' '}
					<ExternalLink href="https://tsup.egoist.dev/">tsup</ExternalLink>, or these days just{' '}
					<ExternalLink href="https://bun.com">Bun</ExternalLink> emit the <code>.js</code>/
					<code>.cjs</code> pair, the matching declarations, and the <code>exports</code> block.
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
					The fix was never a better package.json. It was finally getting that the runtime owns the
					lookup and the language washed its hands of it years ago. Everything weird about{' '}
					<code>exports</code> I'd been copy-pasting on faith had a reason the whole time. I just
					hadn't asked who was answering the question.
				</p>

				<p>
					This post was originally called "WTF, ESM!?" - which seemed appropriate at the time. I
					started writing this post over three years ago and in that time the industry very good
					coding agents. I don't know about you, but I'm not writing code anymore. These intricate
					details are less important for most/many engineers.
				</p>
			</>
		);
	}
}
