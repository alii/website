import {stripIndent} from 'common-tags';
import Link from 'next/link';
import {Carried} from '../../../components/diagrams/carried';
import {JobOrder} from '../../../components/diagrams/job-order';
import {Railway} from '../../../components/diagrams/railway';
import {ResolveFlow} from '../../../components/diagrams/resolve-flow';
import {Trace} from '../../../components/diagrams/trace';
import {ExternalLink} from '../../../components/external-link';
import {Note} from '../../../components/note';
import {SafariConsole} from '../../../components/safari-console';
import {Highlighter} from '../../../components/syntax-highligher';
import {Terminal} from '../../../components/terminal';
import {Post} from '../../Post';

const demo = stripIndent`
	const p = Promise.resolve(1);
	p.constructor = {
		get [Symbol.species]() {
			throw new Error("boom");
		},
	};

	console.log("before");
	await p;
	console.log("done");
`;

export class Railways extends Post {
	public name = 'Fixing a WebKit bug to explain railways';
	public slug = 'railways';
	public date = new Date('23 Aug 2026');
	public hidden = true;
	public keywords = [
		'javascript',
		'promises',
		'webkit',
		'javascriptcore',
		'railway oriented programming',
		'gleam',
		'typescript',
	];
	public excerpt =
		'A two-line ordering bug in JavaScriptCore, and the 2013 decision about promises that made it possible';

	public render() {
		return (
			<>
				<Note variant="warning" title="Draft">
					<p>
						Terminal outputs are real (Node 26.7, Bun 1.4.0 canary, Bun 1.3.14 via npx; trimmed to
						the first error line). The Safari 26 console shows only rows we are sure of; paste
						never.mjs into Safari 26 to confirm what the inspector prints. Safari 27 (macOS 27 beta)
						has the fix. The WebKit PR says the bug came in with the C++ port of the promise jobs
						(Oct 2025), but it is older: WebKit commit e592aeb6 (31 Aug 2020, bug 215996) added the{' '}
						<code>speciesConstructor</code> call to <code>promiseResolveThenableJobFast</code> ahead
						of <code>createResolvingFunctions</code>, so Safari has had it since roughly 14.1. Still
						to check: the paragraph on how you found the bug was removed (it was invented); write
						the real one. Also when <code>PromiseLayer</code> was added to gleam_javascript; the
						final <code>use</code> example is a sketch.
					</p>
				</Note>
				<p>Here is a program that, until July, never finished in Bun or Safari.</p>
				<Highlighter filename="never.mjs" language="javascript">
					{demo}
				</Highlighter>
				<p>
					The getter throws, so <code>await p</code> should throw and the program should crash. Node
					does that. Bun 1.3.14 prints <code>before</code>, reports the error as uncaught, and never
					exits.
				</p>
				<figure className="not-prose my-8 grid gap-5 md:grid-cols-2">
					<Terminal
						title="node"
						lines={[
							{kind: 'cmd', text: 'node never.mjs'},
							'before',
							'Error: boom',
							{kind: 'dim', text: 'exit 1'},
						]}
					/>
					<Terminal
						title="bun 1.3.14"
						lines={[{kind: 'cmd', text: 'bun never.mjs'}, 'before', 'error: boom']}
						running
					/>
				</figure>
				<p>Safari 26 does the same:</p>
				<SafariConsole
					title="Safari 26"
					code={demo}
					rows={[
						{kind: 'log', children: 'before'},
						{kind: 'error', children: 'Error: boom'},
					]}
				/>
				<p>
					Bun and Safari both embed JavaScriptCore. In both, the error is reported as uncaught, the
					promise stays pending, and <code>done</code> never prints.
				</p>
				<p>
					This is{' '}
					<ExternalLink href="https://bugs.webkit.org/show_bug.cgi?id=318399">
						WebKit bug 318399
					</ExternalLink>
					. The <ExternalLink href="https://github.com/WebKit/WebKit/pull/68749">fix</ExternalLink>{' '}
					is 57 lines, most of them a test. The change itself is two steps done in the other order.
				</p>

				<h2>
					<code>resolve</code> does not mean "fulfil"
				</h2>
				<p>
					<code>new Promise(executor)</code> calls <code>executor</code> with two functions,{' '}
					<code>resolve</code> and <code>reject</code>. <code>Promise.resolve(value)</code> and{' '}
					<code>await x</code> create a promise and call the same <code>resolve</code> with{' '}
					<code>value</code>.
				</p>
				<p>
					The usual description of a promise is a box with two exits: <code>resolve(value)</code>{' '}
					and <code>reject(error)</code>. It is right about <code>reject</code> and wrong about{' '}
					<code>resolve</code>. The names give it away: the second function is not called{' '}
					<code>fulfil</code>.
				</p>
				<p>
					<code>reject(reason)</code> marks the promise rejected with <code>reason</code>. It does
					not look at <code>reason</code> and it does not wait.
				</p>
				<p>
					<code>resolve(value)</code> settles the promise using <code>value</code>. If{' '}
					<code>value</code> is not a thenable, the promise is fulfilled with it. If{' '}
					<code>value</code> is a promise, or any object with a <code>.then</code> method,{' '}
					<code>value</code> is not the answer yet. It is another box with the answer inside.{' '}
					<code>resolve</code> waits for <code>value</code> to settle and copies the result, whether
					that is a value or a rejection.
				</p>
				<p>
					The asymmetry exists because a reason is never pending. When something fails you already
					have the failure. A value can arrive later, so the waiting happens on the{' '}
					<code>resolve</code> side. JavaScript has no <code>fulfil</code> function: there is no way
					to say that the value of a promise is another promise.
				</p>
				<p>
					The spec calls what <code>resolve</code> does the resolve procedure (
					<ExternalLink href="https://tc39.es/ecma262/#sec-promise-resolve-functions">
						Promise Resolve Functions
					</ExternalLink>
					). To find out whether <code>value</code> has a <code>.then</code>, it reads{' '}
					<code>value.then</code>. A property read can run a getter, and a getter can throw, so the
					read has three possible results:
				</p>
				<ResolveFlow />
				<p>
					If <code>value.then</code> is a function, the spec calls <code>value</code> a thenable,
					and the promise does not take <code>value</code> as its value. It calls{' '}
					<code>value.then(resolve, reject)</code> and lets <code>value</code> decide. An object
					that is not a promise, only something with a <code>then</code> method, works everywhere a
					promise would:
				</p>
				<Highlighter language="javascript">
					{stripIndent`
						// not a promise, just an object with a then method
						const thenable = {
							then(resolve) {
								resolve(42);
							},
						};

						// resolve() called with the thenable
						await new Promise(resolve => resolve(thenable)); // 42

						// a .then callback returning the thenable
						await Promise.resolve().then(() => thenable); // 42

						// await on the thenable directly
						await thenable; // 42
					`}
				</Highlighter>
				<p>
					The spec calls this assimilation. Below it is called flattening: a promise of a promise
					becomes a promise.
				</p>

				<h2>The job</h2>
				<p>
					The job queued on that branch is{' '}
					<ExternalLink href="https://tc39.es/ecma262/#sec-newpromiseresolvethenablejob">
						<code>NewPromiseResolveThenableJob</code>
					</ExternalLink>
					:
				</p>
				<blockquote>
					<p>
						a. Let <i>resolvingFunctions</i> be CreateResolvingFunctions(<i>promiseToResolve</i>
						).
					</p>
					<p>
						b. Let <i>thenCallResult</i> be Completion(HostCallJobCallback(<i>then</i>,{' '}
						<i>thenable</i>, « <i>resolvingFunctions</i>.[[Resolve]], <i>resolvingFunctions</i>
						.[[Reject]] »)).
					</p>
					<p>
						c. If <i>thenCallResult</i> is an abrupt completion, return ? Call(
						<i>resolvingFunctions</i>.[[Reject]], undefined, « <i>thenCallResult</i>.[[Value]] »).
					</p>
				</blockquote>
				<p>
					In English: create a resolve/reject pair for the promise, call the thenable's{' '}
					<code>then</code> with them, and if calling <code>then</code> throws, reject the promise
					with what was thrown.
				</p>
				<p>
					<code>then</code> is whatever the thenable provides. Even the real{' '}
					<code>Promise.prototype.then</code> does work before it looks at its arguments: it runs{' '}
					<ExternalLink href="https://tc39.es/ecma262/#sec-speciesconstructor">
						<code>SpeciesConstructor</code>
					</ExternalLink>
					, which reads <code>this.constructor</code> and then{' '}
					<code>constructor[Symbol.species]</code> to decide which constructor to use for the new
					promise. Both are property reads, so both can run getters that throw.
				</p>
				<p>
					In the program above, <code>p.constructor[Symbol.species]</code> is a getter that throws.{' '}
					<code>p.then(resolve, reject)</code> throws before it reaches either argument, step c
					catches it, and the promise is rejected with <code>boom</code>. That is the Node output.
				</p>
				<p>
					JavaScriptCore had a fast path for the case where the thenable is a real promise. It did
					the species lookup first and created the resolving functions afterwards. When the lookup
					threw there were no resolving functions yet, so there was nothing to reject with. The
					exception left the job, which is the <code>Error: boom</code> in the inspector, and the
					promise stayed pending.
				</p>
				<JobOrder />
				<p>
					The fix is to do step a before step b. Creating the resolving functions is an allocation
					and cannot throw, and once they exist the function's error handling rejects the promise
					like any other failure.
				</p>

				<h2>Railways</h2>
				<p>
					Scott Wlaschin's{' '}
					<ExternalLink href="https://fsharpforfunandprofit.com/rop/">
						Railway Oriented Programming
					</ExternalLink>{' '}
					draws a function that can fail as a piece of track with one input and two outputs, a
					success track and a failure track.
				</p>
				<Railway input="request" steps={['validate']} success="success" failure="failure" />
				<p>
					Once something is on the failure track it stays there, past every later step, until
					something at the end handles it. Joining two pieces is one operation, <code>bind</code>{' '}
					(Rust's <code>and_then</code>, or the <code>?</code> operator), and the result has the
					same shape as the pieces.
				</p>
				<Railway
					input="request"
					steps={['validate', 'update', 'send']}
					success="success"
					failure="failure"
					train={1}
				/>
				<p>
					Both tracks are typed. In Rust the function above is{' '}
					<code>fn validate(request: Request) -&gt; Result&lt;Request, ValidationError&gt;</code>:
					the failure track says what can travel on it.
				</p>
				<p>
					A promise has a fulfil track and a reject track, and{' '}
					<code>.then(onFulfilled, onRejected)</code> switches between them (
					<ExternalLink href="https://hallski.org/blog/rop-with-promises">
						Hallendal maps one onto the other
					</ExternalLink>
					).
				</p>

				<h2>A promise's failure track has no label</h2>
				<Highlighter language="typescript">
					{stripIndent`
						declare const p: Promise<number>;
					`}
				</Highlighter>
				<p>
					<code>Promise&lt;T&gt;</code> has one type parameter. There is no error type, and{' '}
					<code>.catch</code> gives you <code>reason: any</code>. <code>Promise&lt;T, E&gt;</code>{' '}
					has been requested since{' '}
					<ExternalLink href="https://github.com/microsoft/TypeScript/issues/6283">
						2015
					</ExternalLink>
					; the issue was closed as working as intended:
				</p>
				<blockquote>
					<p>we cannot guarantee the correct type of the exception at design time.</p>
				</blockquote>
				<p>
					The reason is more specific than "JavaScript can throw anything". The resolve procedure
					reads <code>value.then</code>, and calling <code>then</code> runs{' '}
					<code>SpeciesConstructor</code>, two more property reads. Any of those reads can run a
					getter that throws, and when one does, the runtime rejects the promise with whatever was
					thrown. None of those values come from the code awaiting the promise. The reject track is{' '}
					<code>any</code> because the spec puts arbitrary values on it.
				</p>
				<Railway
					input="resolve(value)"
					steps={['read value.then', 'call value.then']}
					success="T"
					failure="any"
					untypedFailure
				/>

				<h2>A promise can't carry a promise</h2>
				<p>
					<code>Promise&lt;Promise&lt;T&gt;&gt;</code> cannot be constructed. Every way of making a
					promise's value a promise goes through the resolve procedure, which flattens it.
				</p>
				<Highlighter language="javascript">
					{stripIndent`
						const inner = new Promise(resolve => resolve(42));
						const outer = new Promise(resolve => resolve(inner));
						const v = await outer; // 42, not a promise
					`}
				</Highlighter>
				<p>
					<code>outer</code>'s <code>resolve</code> runs twice:
				</p>
				<Trace
					events={[
						{text: 'resolve(inner)', note: 'inner.then is a function'},
						{text: 'outer follows inner', tone: 'wait', note: "inner hands 42 to outer's resolve"},
						{text: 'resolve(42)', note: '42 is not an object'},
						{text: 'outer fulfilled with 42', tone: 'ok'},
					]}
				/>
				<p>
					TypeScript models this. Since 4.5,{' '}
					<ExternalLink href="https://devblogs.microsoft.com/typescript/announcing-typescript-4-5/#the-awaited-type-and-promise-improvements">
						<code>Awaited&lt;T&gt;</code>
					</ExternalLink>{' '}
					models "the way that <code>await</code> and <code>.then</code> recursively unwrap
					Promises": <code>Awaited&lt;Promise&lt;Promise&lt;number&gt;&gt;&gt;</code> is{' '}
					<code>number</code>.
				</p>
				<p>
					<code>Promise</code> can hold anything except another promise. A generic{' '}
					<code>Channel&lt;T&gt;</code> or <code>Cache&lt;T&gt;</code> built on promises{' '}
					<ExternalLink href="https://eighty-twenty.org/2024/01/24/more-pitfalls-of-js-promises">
						breaks at runtime
					</ExternalLink>{' '}
					when <code>T</code> is a promise type. It is also why{' '}
					<ExternalLink href="https://rybicki.io/blog/2023/12/23/promises-arent-monads.html">
						promises are not monads
					</ExternalLink>
					: the operation that puts a value in the box fails for one kind of value.
				</p>

				<h2>Why flattening exists</h2>
				<p>
					In 2013 jQuery's Deferreds, Q, Bluebird and when.js each had their own promise, and the
					one thing they shared was a <code>.then</code> method. The{' '}
					<ExternalLink href="https://promisesaplus.com/#the-promise-resolution-procedure">
						Promises/A+ resolution procedure
					</ExternalLink>{' '}
					made anything with a <code>.then</code> get followed, so the libraries could interoperate.
					The discussion is in{' '}
					<ExternalLink href="https://esdiscuss.org/topic/a-challenge-problem-for-promise-designers-was-re-futures">
						the es-discuss thread
					</ExternalLink>
					, Forbes Lindesay's{' '}
					<ExternalLink href="https://gist.github.com/ForbesLindesay/5392612">
						Against Promises For Promises
					</ExternalLink>
					, and{' '}
					<ExternalLink href="https://github.com/domenic/promises-unwrapping/issues/54">
						promises-unwrapping #54
					</ExternalLink>
					, the repository that became the spec text.
				</p>
				<p>
					The cost is that <code>.then</code> does two jobs, map and flatMap, and chooses between
					them at runtime by inspecting the return value. That inspection is the{' '}
					<code>Get(value, "then")</code> in the resolve procedure. It runs on every resolve, it is
					observable, and it can throw.
				</p>

				<h2>What a typed language does about it</h2>
				<p>
					I write a lot of <ExternalLink href="https://gleam.run/">Gleam</ExternalLink>. It is a
					typed language that compiles to the BEAM and to{' '}
					<ExternalLink href="https://gleam.run/news/v0.16-gleam-compiles-to-javascript/">
						JavaScript
					</ExternalLink>
					, which is how <Link href="/gleam-bun-apps">my last post</Link> built Bun executables from
					it. Running on JavaScript means dealing with JavaScript promises, and the library that
					does that,{' '}
					<ExternalLink href="https://hexdocs.pm/gleam_javascript/gleam/javascript/promise.html">
						<code>gleam_javascript</code>
					</ExternalLink>
					, has to answer both problems above. Its promise type has one type parameter:
				</p>
				<Highlighter language="gleam">
					{stripIndent`
						pub type Promise(value)
					`}
				</Highlighter>
				<p>
					The doc comment: it is "not generic over the error type as any Gleam panic or JavaScript
					exception could alter the error value", which would make it "unsound and untypable".
				</p>
				<p>
					There is no <code>then</code>. The JavaScript method is split into the two things it does:
				</p>
				<Highlighter language="gleam">
					{stripIndent`
						pub fn map(promise: Promise(a), callback: fn(a) -> b) -> Promise(b)
						pub fn await(promise: Promise(a), callback: fn(a) -> Promise(b)) -> Promise(b)
					`}
				</Highlighter>
				<p>
					<code>map</code> never flattens and <code>await</code> flattens exactly once. Both call{' '}
					<code>.then</code>. The type checker can only trust <code>map</code> if the runtime does
					not flatten, and the runtime flattens anything with a <code>.then</code>, so the FFI hides
					the promise:
				</p>
				<Highlighter filename="gleam_javascript_ffi.mjs" language="javascript">
					{stripIndent`
						// A wrapper around a promise to prevent \`Promise<Promise<T>>\`
						// collapsing into \`Promise<T>\`.
						class PromiseLayer {
							constructor(promise) { this.promise = promise; }
							static wrap(value)   { return value instanceof Promise ? new PromiseLayer(value) : value; }
							static unwrap(value) { return value instanceof PromiseLayer ? value.promise : value; }
						}
					`}
				</Highlighter>
				<Trace
					events={[
						{text: 'resolve(new PromiseLayer(inner))', note: 'the wrapper has no .then'},
						{text: 'outer fulfilled with the wrapper', tone: 'ok'},
					]}
				/>
				<p>
					A promise returned from a <code>map</code> callback is wrapped in an object with no{' '}
					<code>.then</code>. The resolve procedure fulfils with the wrapper, and the wrapper is
					removed on the other side.
				</p>
				<p>
					The reject track cannot be typed, so the <code>Result</code> goes on the fulfil track:
				</p>
				<Highlighter language="gleam">
					{stripIndent`
						pub fn try_await(
							promise: Promise(Result(a, e)),
							callback: fn(a) -> Promise(Result(b, e)),
						) -> Promise(Result(b, e))
					`}
				</Highlighter>
				<Carried />
				<p>
					<code>Promise(Result(a, e))</code> is a one-track promise carrying a two-track value. The
					promise's own reject track still exists and is still <code>any</code>; it is only used for
					panics. <code>try_await</code> is <code>bind</code>, and with <code>use</code> a chain of
					them reads as straight-line code:
				</p>
				<Highlighter filename="src/app.gleam" language="gleam">
					{stripIndent`
						pub fn main() {
							use version <- promise.try_await(read_version("./VERSION"))
							use range <- promise.try_await(parse_range("^2.0.0"))
							promise.resolve(Ok(semver.satisfies(version, range)))
						}
					`}
				</Highlighter>
				<p>
					Every line can fail, every failure has a type, and nothing touches <code>.catch</code>. In
					TypeScript the same shape is <code>Promise&lt;Result&lt;T, E&gt;&gt;</code>, or{' '}
					<ExternalLink href="https://github.com/supermacro/neverthrow">neverthrow</ExternalLink>
					's <code>ResultAsync</code>.
				</p>

				<h2>Back to the bug</h2>
				<p>
					JavaScriptCore read <code>constructor[Symbol.species]</code> before it had created the
					functions that could reject the promise. The getter threw, and step c was not there to
					catch it. The spec's order, resolving functions first and then the call that can throw,
					guarantees the failure track exists before anything can be put on it. The result of
					breaking that order was not a crash or a wrong answer but a promise that is never
					fulfilled or rejected.
				</p>
				<p>
					test262 had tests for a <code>then</code> getter that throws and for a custom{' '}
					<code>then</code> that resolves, but{' '}
					<ExternalLink href="https://github.com/tc39/test262/pull/5078">
						none for <code>then</code> itself throwing
					</ExternalLink>
					. Step c was untested.
				</p>
				<p>With the two steps in the right order, Bun 1.4 and Safari 27 match Node:</p>
				<figure className="not-prose my-8 md:max-w-[50%]">
					<Terminal
						title="bun 1.4"
						lines={[
							{kind: 'cmd', text: 'bun never.mjs'},
							'before',
							'error: boom',
							{kind: 'dim', text: 'exit 1'},
						]}
					/>
				</figure>
				<h2>tl;dr</h2>
				<ul>
					<li>
						<code>resolve(value)</code> does not mean fulfil with <code>value</code>. If{' '}
						<code>value</code> has a <code>.then</code>, the promise follows <code>value</code>.
						That is flattening, and it is why <code>await</code> works.
					</li>
					<li>
						Flattening is why <code>Promise&lt;T&gt;</code> has no error type: resolving reads
						properties on an object the awaiting code does not control, and any of them can throw
						onto the reject track.
					</li>
					<li>
						Flattening is why <code>Promise&lt;Promise&lt;T&gt;&gt;</code> cannot exist, why{' '}
						<code>Awaited&lt;T&gt;</code> is recursive, and why promises are not monads.
					</li>
					<li>
						Railway oriented programming needs both tracks typed. Promises give you one. Put a{' '}
						<code>Result</code> on the fulfil track: <code>Promise(Result(a, e))</code> in Gleam,{' '}
						<code>Promise&lt;Result&lt;T, E&gt;&gt;</code> in TypeScript.
					</li>
					<li>
						The bug: JavaScriptCore did the step that can throw before building the failure track.
						The fix builds the failure track first.
					</li>
				</ul>
			</>
		);
	}
}
