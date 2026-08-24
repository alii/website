import {stripIndent} from 'common-tags';
// import Link from 'next/link';
// import {Carried} from '../../../components/diagrams/carried';
// import {JobOrder} from '../../../components/diagrams/job-order';
// import {Railway} from '../../../components/diagrams/railway';
import {ResolveFlow} from '../../../components/diagrams/resolve-flow';
// import {Trace} from '../../../components/diagrams/trace';
import {ExternalLink} from '../../../components/external-link';
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
	public excerpt = 'How JavaScript promises settle using train tracks as an example';

	public render() {
		return (
			<>
				<p>Here is a program that, until July, never finished in Bun or Safari.</p>
				<Highlighter filename="never.mjs" language="javascript">
					{demo}
				</Highlighter>
				<p>
					Don't worry if you don't understand what's going on. The spec says that, because the
					getter throws, <code>await p</code> should also throw, then the program should crash.
					Node.js does, but Safari 26 and Bun 1.3.14 print <code>'before'</code>, report the error,
					and then never finish.
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
				<p>Safari 26 fails the same way as Bun:</p>
				<SafariConsole
					title="Safari 26"
					code={demo}
					rows={[
						{kind: 'log', children: 'before'},
						{kind: 'error', children: 'Error: boom'},
					]}
				/>
				<p>
					Bun and Safari both embed JavaScriptCore so the behaviour is the same - the promise is
					never settled! This was{' '}
					<ExternalLink href="https://bugs.webkit.org/show_bug.cgi?id=318399">
						WebKit bug 318399
					</ExternalLink>{' '}
					and <ExternalLink href="https://github.com/WebKit/WebKit/pull/68749">my fix</ExternalLink>{' '}
					was only +16 lines!
				</p>
				<p>What went wrong?</p>
				<h2>
					What <code>resolve</code> does
				</h2>
				<p>Let's quickly brush up on promises.</p>
				<p>
					When you construct a new promise in JavaScript, the engine creates two functions,{' '}
					<code>resolve</code> and <code>reject</code>, and the engine passes them to the callback
					you pass to the promise constructor.
				</p>
				<Highlighter filename="new-promise.js" language="javascript">
					{stripIndent`
						new Promise((resolve, reject) => {
							console.log("I got my resolve function!", resolve);
							console.log("I got my reject function!", reject);
							resolve(42);
						});

						// In V8 this logs:
						//		I got my resolve function! ƒ () { [native code] }
						//		I got my reject function! ƒ () { [native code] }
					`}
				</Highlighter>
				<p>
					The builtin helper function <code>Promise.resolve(value)</code> does the same thing by
					constructing a promise and immediately calling the <code>resolve</code> with the value you
					passed. A simple userland implementation would look like this:
				</p>
				<Highlighter filename="promise-resolve.js" language="javascript">
					{stripIndent`
						function PromiseDotResolve(value) {
							return new Promise(resolve => resolve(value))
						}
					`}
				</Highlighter>
				<p>
					The same is also true for literally writing <code>await 42</code>. The engine creates a
					promise and immediately calls <code>resolve(42)</code>, just like{' '}
					<code>Promise.resolve()</code> does.
				</p>
				<p>
					Many folks think of a promise as a value that can exit in two ways - resolved with a value
					or a rejected with a reason. This is a reasonable mental model since it maps pretty
					closely to how using promises actually feel when writing JavaScript day-to-day. Therefore,
					a naive implementation of a promise might look like this:
				</p>
				<Highlighter filename="mediocre-promise.ts" language="typescript">
					{stripIndent`
						type PromiseState<T> =
							| {type: 'pending'}
							| {type: 'resolved', value: T}
							| {type: 'rejected', value: unknown};

						class MediocrePromise<T> {
							private state: PromiseState<T>
							private callbacks: Array<() => void> = []; // registered by .then()

							private resolve(value: T) {
								this.settle({type: 'resolved', value});
							}

							private reject(reason: unknown) {
								this.settle({type: 'resolved', reason});
							}

							private settle(state: 'resolved' | 'rejected', value: unknown) {
								this.state = state;
								for (const callback of this.callbacks) callback();
							}
							
							// For example's sake this is missing \`constructor\`, \`then\`, etc.
						}
					`}
				</Highlighter>
				<p>
					Sadly, this implementation lacks an important difference between how resolving and
					rejecting work.
				</p>
				<p>
					Let's start with rejections. Rejecting a promise is simple! Calling{' '}
					<code>reject(reason)</code> will mark the promise as rejected, with <code>reason</code> as
					the rejected value. Excellent. Our <code>MediocrePromise</code> implements rejections
					correctly!
				</p>
				<p>
					Resolving is more complex. Calling <code>resolve(value)</code> does <i>not</i> store{' '}
					<code>value</code> straight away. First, it checks whether <code>value</code> has a{' '}
					<code>.then()</code> method. If it <b>doesn't</b> (e.g. a number, a string, an object
					without one, ..) then the promise is fulfilled with <code>value</code> and we are done.
					Otherwise, if <code>value</code> <b>does</b> have a <code>.then()</code> method, then{' '}
					<code>value</code> is treated like <i>another</i> promise. Our original promise is{' '}
					<i>not</i> settled yet and, instead, <code>resolve</code> calls <code>value.then()</code>{' '}
					with itself and the reject function: <code>value.then(resolve, reject)</code>. Whichever
					of those <code>value.then()</code> <i>eventually</i> calls is what settles the promise.
					Sorry, that was a mouthful. There's a diagram in a sec to explain. Bear with me.
				</p>
				<p>
					This asymmetry exists because a failure is not a pending operation. When something fails
					then it has <i>already</i> failed. We are not expecting the failure in the future, because
					it just happened. <b>We already have the failure!</b> So you already have the reason in
					your code (presumably an error) and so you can call <code>reject()</code> immediately. On
					the other side, a useful value can arrive later, for example waiting for a request stream
					to finish so we could turn the body into JSON, so the waiting only ever happens on the{' '}
					<code>resolve</code> side.
				</p>
				<p>
					The <code>resolve</code> function{' '}
					<ExternalLink href="https://tc39.es/ecma262/#sec-promise-resolve-functions">
						is defined in the spec
					</ExternalLink>{' '}
					as the <b>resolve procedure</b>. To find out whether <code>value</code> has a{' '}
					<code>.then</code>, it reads <code>value.then</code>, and doing property read can run any
					getters, and a getter can throw (just like in our program at the beginning). So, looking
					for the <code>then()</code> method on a value can result in three possible states:
				</p>
				<ResolveFlow />

				<p>Our MediocrePromise is missing the extra check and additional behaviour!</p>

				<p>
					In the path where <code>value.then</code> is a function, the spec considers{' '}
					<code>value</code> to be a <b>thenable</b>. Thus, Promises are also thenables because they
					have a <code>.then()</code> method. A regular object that is <i>not</i> a promise but does
					have a <code>.then()</code> method is also a thenable, just like a promise is, and so it
					works everywhere a promise would. For example:
				</p>
				<Highlighter language="javascript">
					{stripIndent`
						// \`thenable\` is not a promise!
						const thenable = {
							then(resolve, _reject) { // \`resolve(thenable)\` will pass resolve
								resolve(42);           // *and* reject to the \`.then()\`, so we accept both
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
					The spec calls this process of passing the resolve/reject pair to a thenable{' '}
					<i>"assimilation"</i>. Perhaps a friendlier term for this behaviour might be "flattening"
					because instead of resolving with the inner promise, we wait for it instead. Our chain of
					promises got "flattened" because we just moved what we were waiting for.
				</p>

				<p>A promise of a promise flattens to only one promise.</p>

				{/* <h2>The job</h2>
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
					<code>Promise&lt;Promise&lt;T&gt;&gt;</code> cannot be constructed. JavaScript gives you{' '}
					<code>resolve</code> and never <code>fulfil</code>, so every way of setting a promise's
					value goes through the resolve procedure, which flattens it.
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
				</ul> */}
			</>
		);
	}
}
