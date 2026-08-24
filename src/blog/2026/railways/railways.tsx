import {stripIndent} from 'common-tags';
import Link from 'next/link';
import {Carried} from '../../../components/diagrams/carried';
import {JobOrder} from '../../../components/diagrams/job-order';
import {Railway} from '../../../components/diagrams/railway';
import {ResolveFlow} from '../../../components/diagrams/resolve-flow';
import {Trace} from '../../../components/diagrams/trace';
import {ExternalLink} from '../../../components/external-link';
import {SafariConsole} from '../../../components/safari-console';
import {Highlighter} from '../../../components/syntax-highligher';
import {Terminal} from '../../../components/terminal';
import {Post} from '../../Post';

const demo = `const p = Promise.resolve(1);
p.constructor = {
	get [Symbol.species]() {
		throw new Error("boom");
	},
};

console.log("before");
await p;
console.log("done");`;

export class Railways extends Post {
	public name = 'Fixing a WebKit bug to explain railways';
	public slug = 'webkit-railways';
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
	public excerpt = 'An in-depth guide to JavaScript promises';

	public render() {
		return (
			<>
				<p>Here is a program that, until July, never finished in Bun or Safari.</p>
				<Highlighter filename="never.mjs" language="javascript">
					{demo}
				</Highlighter>
				<p>
					Don't worry if you don't understand this code yet. The spec says that because the getter
					throws, then <code>await p</code> should also throw, and so the program should crash.
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
					passed (with the exception that if <code>value</code> is already a promise, it is returned
					as is). A simple userland implementation would look like this:
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
					<code>Promise.resolve()</code> does. Similarly, awaiting something that is already a
					promise skips this and uses that promise directly.
				</p>
				<p>
					Many folks think of a promise as a value that can end in two ways - fulfilled with a value
					or rejected with a reason. This is a reasonable approximation since it maps pretty closely
					to how using promises actually feel when writing JavaScript day-to-day. Therefore, a naive
					implementation of a promise might look like this:
				</p>
				<Highlighter filename="mediocre-promise.ts" language="typescript">
					{stripIndent`
						type PromiseState<T> =
							| {type: 'pending'}
							| {type: 'resolved', value: T}
							| {type: 'rejected', value: unknown};

						class MediocrePromise<T> {
							private state: PromiseState<T> = {type: 'pending'};
							private callbacks: Array<() => void> = []; // registered by .then()

							private resolve(value: T) {
								this.settle({type: 'resolved', value});
							}

							private reject(reason: unknown) {
								this.settle({type: 'rejected', value: reason});
							}

							private settle(state: PromiseState<T>) {
								this.state = state;
								for (const callback of this.callbacks) callback();
							}

							// For example's sake this is missing \`constructor\`, \`then\`, etc.
						}
					`}
				</Highlighter>
				<p>
					Sadly, this implementation misses an important difference between how resolving and
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
					without one, ..) then the promise is <b>fulfilled</b> with <code>value</code> and we are
					done. Otherwise, if <code>value</code> <b>does</b> have a <code>.then()</code> method,
					then <code>value</code> is treated like <i>another</i> promise. Our original promise is{' '}
					<i>not</i> settled yet and, instead, <code>resolve</code> calls <code>value.then()</code>{' '}
					with itself and the reject function: <code>value.then(resolve, reject)</code>. Whichever
					of those <code>value.then()</code> <i>eventually</i> calls is what settles the promise.
					Sorry, that was a mouthful. There's a diagram in a sec to explain. Bear with me.
				</p>
				<p>
					This asymmetry exists because{' '}
					<i>
						<b>a failure is not a pending operation</b>
					</i>
					. When something fails, you <b>already</b> have the reason in your code! (presumably an
					error). So you can call <code>reject(reason)</code> immediately. This is, of course, not
					the case for resolving, where a useful value might arrive later. For example a common case
					is waiting for a request stream to finish so we can turn the body into JSON. This is why
					the extra behaviour is only implemented in <code>resolve</code>.
				</p>
				<p>
					The <code>resolve</code> function{' '}
					<ExternalLink href="https://tc39.es/ecma262/#sec-promise-resolve-functions">
						is defined in the spec
					</ExternalLink>{' '}
					as the <b>resolve procedure</b>. To find out whether <code>value</code> has a{' '}
					<code>.then</code>, it reads <code>value.then</code>, and a property read can run a
					getter, and a getter can throw (just like in our program at the beginning). So, looking
					for the <code>then()</code> method on a value can result in three possible outcomes:
				</p>
				<ResolveFlow />
				<p>Our MediocrePromise is missing the extra check and additional behaviour!</p>
				<p>
					In the path where <code>value.then</code> is a function, the spec considers{' '}
					<code>value</code> to be a <b>thenable</b>. Promises are thenables, since they have a{' '}
					<code>.then()</code> method. Anything else with a <code>.then()</code> method is one too,
					and works everywhere a promise would. For example:
				</p>
				<Highlighter language="javascript">
					{stripIndent`
						// \`thenable\` is not a promise!
						const thenable = {
							// resolve(thenable) calls this with the outer promise's resolve and reject
							then(resolve, _reject) {
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
					The spec calls this process of passing the resolve/reject pair to a thenable{' '}
					<i>"assimilation"</i>. Perhaps a friendlier word is "flattening": instead of holding the
					inner promise as its value, the outer promise waits for it, so two layers become one.
				</p>
				<p>
					Note that "resolved" isn't a state. MediocrePromise also got this one wrong! Once{' '}
					<code>resolve</code> has been called the outcome can no longer change, but the promise can
					still be pending:
				</p>
				<Highlighter language="javascript">
					{stripIndent`
						const inner = new Promise(() => {}); // never settles
						const outer = new Promise(resolve => resolve(inner));
					`}
				</Highlighter>
				<p>
					Here, <code>outer</code> was resolved, but it stays pending forever because{' '}
					<code>inner</code> never settles. MediocrePromise's <code>resolved</code> state was
					actually the spec's definition of fulfilled.
				</p>
				<h2>The job</h2>
				<p>As a reminder, here's that diagram again:</p>
				<ResolveFlow />
				<p>
					In the path on the right, where <code>value.then</code> is a function, the engine does not
					call the <code>.then()</code> immediately. Instead, the engine queues a job, which we call
					a microtask. The spec names this particular job a{' '}
					<ExternalLink href="https://tc39.es/ecma262/#sec-newpromiseresolvethenablejob">
						<code>NewPromiseResolveThenableJob</code>
					</ExternalLink>{' '}
					and it is defined as follows:
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
				<p>Sorry, that's another mouthful. Let me translate:</p>
				<ol type="a">
					<li>Create a new resolve/reject function pair</li>
					<li>
						Call the thenable's <code>.then(resolve, reject)</code> function (with the newly created
						resolve/reject functions)
					</li>
					<li>
						If calling <code>.then()</code> throws, reject the promise with whatever was thrown
					</li>
				</ol>
				<p>
					Remember that <code>.then</code> is simply whatever is defined on the thenable. When the
					thenable is a real promise, the <code>.then</code> is the one defined on the promise's
					prototype - <code>Promise.prototype.then</code>.
				</p>
				<p>
					Why would <code>Promise.prototype.then</code> care about <code>Symbol.species</code>?
				</p>
				<p>
					It cares because <code>.then()</code> returns a <i>new</i> promise, which is what lets you
					chain <code>.then().then()</code>. If you subclass <code>Promise</code>, you'd expect{' '}
					<code>.then()</code> to hand back an instance of your subclass, not a plain{' '}
					<code>Promise</code>:
				</p>
				<Highlighter language="javascript">
					{stripIndent`
						class MyPromise extends Promise {}
						MyPromise.resolve(1).then(x => x) instanceof MyPromise; // true
					`}
				</Highlighter>
				<p>
					So before a real promise's <code>then</code> does anything with its arguments, it works
					out which constructor to build the <i>new</i> promise with. It does this by first reading{' '}
					<code>this.constructor</code>, then by reading <code>constructor[Symbol.species]</code>{' '}
					(the spec calls this step{' '}
					<ExternalLink href="https://tc39.es/ecma262/#sec-speciesconstructor">
						<code>SpeciesConstructor</code>
					</ExternalLink>
					). Both are ordinary property reads and, as we found out, property reads can run getters,
					and getters can throw.
				</p>
				<p>
					This is precisely what our original program at the beginning does!{' '}
					<code>p.constructor</code> has a <code>[Symbol.species]</code> getter that throws, so{' '}
					<code>p.then(resolve, reject)</code> throws before it ever reaches its arguments. Step c
					of the <code>NewPromiseResolveThenableJob</code> is designed to catch and reject our
					promise with <code>boom</code>. That's the spec-correct behaviour we saw in V8/Node.js.
				</p>
				<p>So why did JavaScriptCore get this wrong?</p>
				<p>
					JavaScriptCore had a fast path for the most-common case where the thenable is a real,
					normal promise, and that fast path did the species lookup <i>first</i>, only creating the
					resolve/reject functions afterwards. When the lookup threw, the resolving functions didn't
					exist yet, so there was nothing to reject with. The exception escaped the job entirely
					(that's the red <code>Error: boom</code> in the inspector) and our promise stayed pending
					forever.
				</p>
				<JobOrder />
				<p>
					Luckily, the fix is simple, and might already be obvious to you! We must create our
					resolve/reject functions before calling <code>.then()</code>, so that we actually have the
					ability to reject the promise if calling <code>.then()</code> throws. Creating the
					resolving functions is just an allocation and allocations can't throw, and once the
					functions exist then the existing error handling rejects the promise like any other
					failure.
				</p>
				<h2>Railways</h2>
				<p>
					Scott Wlaschin's{' '}
					<ExternalLink href="https://fsharpforfunandprofit.com/rop/">
						Railway Oriented Programming
					</ExternalLink>{' '}
					draws any step that can fail as a piece of track with one input and two outputs: a success
					track and a failure track.
				</p>
				<Railway input="request" steps={['validate()']} success="success" failure="failure" />
				<p>
					Each chunk of the railway is a function returning a <code>Result</code>. Most
					implementations of a <code>Result</code> type will accept <b>two type parameters</b>, the
					success type and the failure type, one per track. In Rust you could imagine this
					function's signature being:
				</p>
				<Highlighter language="rust">
					fn validate(request: Request) -&gt; Result&lt;Request, ValidationError&gt;
				</Highlighter>
				<p>
					The <code>Result</code> type enforces this: <code>validate()</code>'s success track can
					only carry a <code>Request</code> and its failure track can only ever carry a{' '}
					<code>ValidationError</code>.
				</p>
				<p>
					Once something is on the failure track it stays there, skipping every later step, until
					something at the end deals with the result. You might join two pieces with one operation
					(Wlaschin calls this <code>bind</code> - not to be confused with JavaScript's{' '}
					<code>fn.bind()</code> method). Rust folks might know this joining operation as{' '}
					<code>and_then</code>, or the <code>?</code> operator. The result has the same shape as
					the pieces, so you can keep joining.
				</p>
				<Railway
					input="request"
					steps={['validate()', 'update()', 'send()']}
					success="success"
					failure="failure"
					train={1}
				/>
				<p>
					Promises kinda look a lot like this! There's a fulfilled track and a rejected track, and{' '}
					<code>.then(onFulfilled, onRejected)</code> is the switch between them.
				</p>
				<p>So is a promise a railway?</p>
				<h2>A promise's failure track has no label</h2>
				<Highlighter language="typescript">
					{stripIndent`
						declare const p: Promise<number>;
					`}
				</Highlighter>
				<p>
					In TypeScript, the <code>Promise&lt;T&gt;</code> interface has only one type parameter, so
					no room for an error type. TypeScript users have asked for a{' '}
					<code>Promise&lt;T, E&gt;</code> since 2015 -{' '}
					<ExternalLink href="https://github.com/microsoft/TypeScript/issues/6283">
						microsoft/TypeScript#6283
					</ExternalLink>
					! Ron Buckton, who used to work on TypeScript at Microsoft, closed this issue, writing:
				</p>
				<blockquote>
					<p>we cannot guarantee the correct type of the exception at design time.</p>
				</blockquote>
				<p>
					Which, we have now learnt, is true! We just saw the runtime reject a promise with{' '}
					<code>boom</code>, a value that was thrown in a getter far way from any userland{' '}
					<code>reject()</code> call. If the spec itself can put values on the reject track, then
					even code that only ever calls <code>reject()</code> with one type cannot be given an{' '}
					<code>E</code>. The failure track has to be <code>any</code> (okay, yes it could be
					unknown, but adoption and backwards compatibility are also important things for a project
					of TypeScript's scope and size to care about!).
				</p>
				<p>Here's that represented as a railway:</p>
				<Railway
					input="resolve(value)"
					steps={['read value.then', 'call value.then']}
					success="T"
					failure="anything!?!?"
					untypedFailure
				/>
				<p>
					Generally I think engineers who have thought "why doesn't a promise type it's rejection?"
					and tried to land on an answer will land on "JavaScript lets you throw anything". It's
					good that engineers are thinking about these things and even better if they reach this
					quite logical conclusion, and the real reason is so subtle!
				</p>
				<p>Phew.</p>
				<h2>A promise can't carry a promise</h2>
				<p>
					We touched on this earlier, but to reiterate: <code>Promise&lt;Promise&lt;T&gt;&gt;</code>{' '}
					cannot be constructed because, remember, if you resolve a promise with another promise
					then we just wait for that second promise instead. Here's an example to drill it in:
				</p>
				<Highlighter language="javascript">
					{stripIndent`
						const inner = new Promise(resolve => resolve(42));
						const outer = new Promise(resolve => resolve(inner));
						const v = await outer; // we got 42, not the inner promise
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
					In 4.5, the TypeScript team added the{' '}
					<ExternalLink href="https://devblogs.microsoft.com/typescript/announcing-typescript-4-5/#the-awaited-type-and-promise-improvements">
						<code>Awaited&lt;T&gt;</code>
					</ExternalLink>{' '}
					type, which the release notes describe as modelling "the way that <code>await</code> and{' '}
					<code>.then</code> recursively unwrap Promises" - so{' '}
					<code>Awaited&lt;Promise&lt;Promise&lt;number&gt;&gt;&gt;</code> is just{' '}
					<code>number</code>.
				</p>

				<p>
					JavaScript implements this promise flattening behaviour because back when the promise spec
					was being worked on in 2013 there were many competing userland implementations of
					promises. You might've seen jQuery's deferreds, Q, Bluebird, etc in older code,
					pre-promises JavaScript code. The one thing these libraries all had in common was that
					they all had a <code>.then()</code> method - we now know those objects to be called{' '}
					<b>thenable</b>s!
				</p>

				<p>
					To ease the ecosystem into the migration, the team working on the spec decided to allow
					any thenable to interop with another, and thus the behaviour of an outer promise waiting
					on an inner promises was decided on.
				</p>

				<p>
					Much of the original discussion is still preserved in{' '}
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
					, which is the repository that eventually became the spec text.
				</p>

				<p>
					The cost of that compromise is that every <code>resolve</code> has to look at the value it
					was given and that is bascially everything I've talked about up until this point.
				</p>
				<h2>What could a new language do about this?</h2>
				<p>
					You might have seen me talk about{' '}
					<ExternalLink href="https://gleam.run">Gleam</ExternalLink> before. It's really great and
					I write a lot of it! It is a typed language that compiles to the BEAM and to{' '}
					<ExternalLink href="https://gleam.run/news/v0.16-gleam-compiles-to-javascript/">
						JavaScript
					</ExternalLink>
					, which is how <Link href="/gleam-bun-apps">my last post</Link> built Bun executables from
					it. It's almost impossible to write JavaScript in 2026 without eventually handling
					promises, so the library that does that in Gleam -{' '}
					<ExternalLink href="https://hexdocs.pm/gleam_javascript/gleam/javascript/promise.html">
						<code>gleam_javascript</code>
					</ExternalLink>{' '}
					- needs a promise type. It's defined like this:
				</p>
				<Highlighter language="gleam">
					{stripIndent`
						pub type Promise(value)
					`}
				</Highlighter>
				<p>Very simple! And look carefully, no error type, just like TypeScript!</p>
				<p>
					The doc comment above it says "not generic over the error type as any Gleam panic or
					JavaScript exception could alter the error value", which would make it "unsound and
					untypable". In other words, the failure track is intentionally left unlabelled, just like
					TypeScript.
				</p>
				<p>
					But interestingly, unlike TypeScript, <code>gleam_javascript</code>does not implement a{' '}
					<code>.then()</code> method anywhere! Instead, it's split into two.
				</p>
				<Highlighter language="gleam">
					{stripIndent`
						pub fn map(promise: Promise(a), callback: fn(a) -> b) -> Promise(b)
						pub fn await(promise: Promise(a), callback: fn(a) -> Promise(b)) -> Promise(b)
					`}
				</Highlighter>
				<p>
					Sorry if this Gleam syntax is a bit new and scary. The lowercase letters are how Gleam
					represents type-parameters. Below is the equivalent TypeScript to help you understand and
					translate:
				</p>
				<Highlighter
					language="typescript"
					footer={
						<>
							Note: <code>await</code> is not a valid identifier in JavaScript, the function could
							instead be named <code>await_</code>.
						</>
					}
				>
					{stripIndent`
						export function map<A, B>(promise: Promise<A>, callback: (value: A) => B): Promise<B>
						export function await<A, B>(promise: Promise<A>, callback: (value: A) => Promise<B>): Promise<B>
					`}
				</Highlighter>
				<p>
					According to these signatures, the <code>map</code> function guarantees it will never
					flatten a promise, and the <code>await</code> function guarantees to flatten exactly once.
					Internally both of these functions will call <code>.then()</code>, but Gleam's type
					checker can only trust <code>map</code> if the runtime really doesn't flatten! We already
					know that the engine will flatten anything with a <code>.then()</code>, so to get around
					this, <code>gleam_javascript</code> hides the promise by wrapping it in an extra layer:
				</p>
				<Highlighter
					filename="gleam_javascript_ffi.mjs"
					language="javascript"
					footer={
						<>
							Source:{' '}
							<ExternalLink
								className="text-inherit"
								href="https://github.com/gleam-lang/javascript/blob/b51b4365c2b5fa3f9767a349a7e7a68a874264cb/src/gleam_javascript_ffi.mjs#L44"
							>
								github.com/gleam-lang/javascript#b51b4365c2b5fa3f9767a349a7e7a68a874264cb
							</ExternalLink>
						</>
					}
				>
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
				<p>
					Here is what <code>map</code> and <code>await</code> do with it, one step per line:
				</p>
				<Highlighter filename="gleam_javascript_ffi.mjs (unrolled)" language="javascript">
					{stripIndent`
						export function promise_map(promise, fn) {
							return promise.then((value) => {
								const unwrapped = PromiseLayer.unwrap(value); // take off any layer from the previous step
								const result = fn(unwrapped);                 // run your callback
								return PromiseLayer.wrap(result);             // if it returned a promise, hide it
							});
						}

						export function promise_await(promise, fn) {
							return promise.then((value) => {
								const unwrapped = PromiseLayer.unwrap(value);
								return fn(unwrapped);                         // no wrap: a returned promise gets followed
							});
						}
					`}
				</Highlighter>
				<p>
					If we try to resolve a promise with another promise wrapped in the PromiseLayer, the
					engine does not follow it and the PromiseLayer is returned:
				</p>
				<Trace
					events={[
						{text: 'resolve(new PromiseLayer(inner))', note: 'the wrapper has no .then'},
						{text: 'outer fulfilled with the wrapper', tone: 'ok'},
					]}
				/>
				<p>
					The <code>await</code> function does not <code>wrap</code>, so a returned promise is
					followed, which is the flattening behaviour that its signature guarantees.
				</p>
				<p>
					Because, just like TypeScript, the reject track can't be typed, the pattern in Gleam is to
					always old a<code>Result</code> type in the <i>fulfil</i> track:
				</p>
				<Highlighter language="gleam">
					{stripIndent`
						pub fn try_await(
							promise: Promise(Result(a, e)),
							callback: fn(a) -> Promise(Result(b, e)),
						) -> Promise(Result(b, e))
					`}
				</Highlighter>
				<p>Which might look like this if we draw it as train tracks:</p>
				<Carried />
				<p>
					So Gleam's pattern of <code>Promise(Result(a, e))</code> is encoding a two-track result
					onto a one-track promise. The promise's own reject track is still there, and still{' '}
					untyped, but now it's only ever used for absolute disasters. The <code>try_await</code>{' '}
					function is Gleam's version of <code>bind</code> (which we talked about earlier), and with
					Gleam's{' '}
					<ExternalLink href="https://tour.gleam.run/advanced-features/use/">
						<code>use</code>
					</ExternalLink>{' '}
					syntax, a chain of them reads like normal straight-line code, or code that is on a single
					straight-line train track with no switches!
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
				<p>Super tidy! Thank you Gleam, very cool.</p>
				<p>
					Every line can fail, every failure has a type, and nothing ever touches{' '}
					<code>.catch()</code>! You could do the same in TypeScript by always using a result type
					in promises: <code>Promise&lt;Result&lt;T, E&gt;&gt;</code>, or with something like{' '}
					<ExternalLink href="https://github.com/supermacro/neverthrow">neverthrow</ExternalLink>
					's <code>ResultAsync</code>.
				</p>
				<h2>So are promises train tracks?</h2>
				<p>Well, uh, no. Sorry. That question doesn't even really make sense. My fault.</p>
				<p>
					A promise does have two tracks, but it's impossible to type the failure track and since
					promises are always flattened [todo]. In comparison, a <code>Result</code> has both its
					well-known failure type, and the ability to hold another <code>Result</code>, with{' '}
					<code>bind</code> removing a layer only when you ask it to.
				</p>

				<p>
					With the two steps in the right order in JavaScriptCore, Bun 1.4 and Safari 27 now behave
					like the spec, and like Node:
				</p>
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

				<p>
					If you really did make it this far then I'm glad you are as excited about promises as I
					am. Thank you very much for reading!
				</p>
			</>
		);
	}
}
