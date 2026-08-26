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
					Don't worry if this looks confusing. The spec says that because the getter throws an
					error, then <code>await p</code> should also throw, and so the program should crash.
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
					<code>resolve</code> and <code>reject</code>, and passes them to the callback you pass to
					the promise constructor.
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
					constructing a promise and immediately calling <code>resolve</code> with the value you
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
					to how using promises actually feels when writing JavaScript day-to-day. Therefore, a
					naive implementation of a promise might look like this:
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
					I've called it MediocrePromise. It has a pending state, a way to resolve with a value, and
					a way to reject with a reason. It even has a list of callbacks to run, just like a real
					promise! Is this a good implementation?
				</p>
				<p>
					Sadly, no. It is not a good implementation. MediocrePromise misses an important difference
					between how resolving and rejecting work.
				</p>
				<p>
					Let's start with rejections. Rejecting a promise is simple! Calling{' '}
					<code>reject(reason)</code> marks the promise as rejected, with <code>reason</code> as the
					rejected value. Excellent! MediocrePromise implements rejections correctly!
				</p>
				<p>
					Resolving is more complex. Calling <code>resolve(value)</code> does <i>not</i> store{' '}
					<code>value</code> straight away. First, it checks whether <code>value</code> has a{' '}
					<code>.then()</code> method. If it <b>doesn't</b> (e.g. a number, a string, an object
					without one, ..) the promise is <b>fulfilled</b> with <code>value</code> and we are done.
					Otherwise, if it <b>does</b> have a <code>.then()</code> method, <code>value</code> is
					treated like <i>another</i> promise. Our original promise is <i>not</i> settled yet and
					instead, <code>resolve</code> passes itself and the reject function to{' '}
					<code>value.then(resolve, reject)</code>. Whichever of those functions{' '}
					<code>value.then()</code> <i>eventually</i> calls is what settles the promise. Sorry, that
					was a mouthful. There's a diagram in a sec to explain. Bear with me.
				</p>
				<p>
					The <code>resolve</code> function{' '}
					<ExternalLink href="https://tc39.es/ecma262/#sec-promise-resolve-functions">
						is defined in the spec
					</ExternalLink>{' '}
					as the <b>resolve procedure</b>. To find out whether <code>value</code> has a{' '}
					<code>.then</code>, it reads <code>value.then</code>, and a property read can run a
					getter, and a getter can throw (just like in our program at the beginning). So, looking
					for a <code>.then()</code> method on some value can result in three possible outcomes:
				</p>
				<ResolveFlow />
				<p>Our MediocrePromise is missing the extra check and additional behaviour!</p>

				<p>
					This asymmetry exists because{' '}
					<i>
						<b>a failure is not a pending operation</b>
					</i>
					. When something fails, you <b>already</b> have the reason in your code (presumably an
					error)! So you can call <code>reject(reason)</code> immediately. This is not the case for
					the happy path of resolving, where a useful value might arrive later:
				</p>
				<Highlighter language="javascript">
					{stripIndent`
						reject(new Error("bad request")); // the reason is right here
						resolve(response.json());         // the body is still arriving
					`}
				</Highlighter>
				<p>
					This is why the extra behaviour is only implemented in <code>resolve</code>.
				</p>

				<p>
					In the path where <code>value.then</code> <i>is</i> a function, the spec considers{' '}
					<code>value</code> to be a <b>thenable</b>. Promises are thenables, since they have a{' '}
					<code>.then()</code> method. Any other object with a <code>.then()</code> method is a
					thenable too. Thenables work everywhere a promise would.
				</p>
				<p>
					Simply put: a <b>thenable</b> is any value with a <code>.then()</code> method. Therefore,
					any promise is also a thenable.
				</p>
				<p>For example:</p>
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
					The spec calls the aforementioned process of passing the resolve/reject functions to a
					thenable's <code>.then()</code> <b>assimilation</b>. But, perhaps a friendlier word is{' '}
					<b>flattening</b>: instead of holding the inner thenable as its value, the outer promise
					waits for it, so two layers become one.
				</p>
				<p>
					Lastly, note that "resolved" isn't a real promise state. MediocrePromise also got this one
					wrong! The outcome cannot change once <code>resolve</code> has been called, but the
					promise can absolutely still be pending:
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
				<h2>Railways</h2>
				<p>Let's go down a quick tangent.</p>
				<p>
					Scott Wlaschin's article{' '}
					<ExternalLink href="https://fsharpforfunandprofit.com/rop/">
						Railway Oriented Programming
					</ExternalLink>{' '}
					draws fallible code as a piece of track with one input and two outputs: a success track
					and a failure track.
				</p>
				<Railway input="request" steps={['validate()']} success="success" failure="failure" />
				<p>
					Once a request hits the failure track it stays there, skipping every later step, until
					something at the end deals with the result. Wlaschin calls joining two pieces of the
					railway <i>binding</i> - not to be confused with JavaScript's <code>fn.bind()</code>. Rust
					folks might know binding as <code>and_then</code>, or maybe the <code>?</code> operator.
					They all mean the same thing: run the next bit of code only if the previous bit succeeded,
					otherwise pass the failure straight through.
				</p>
				<p>
					Look at how the last step is skipped because the <code>update()</code> failed:
				</p>
				<Railway
					input="request"
					steps={['validate()', 'update()', 'send()']}
					success="success"
					failure="failure"
					train={1}
				/>
				<p>
					You can think of each piece of the railway as a function returning a <code>Result</code>.
					In strongly typed languages, most implementations of a <code>Result</code> type will
					accept <b>two type parameters</b>, the success type and the failure type, one per track.
					For example in Rust you could imagine a <code>validate</code> function's signature being:
				</p>
				<Highlighter language="rust">
					fn validate(request: Request) -&gt; Result&lt;Request, ValidationError&gt;
				</Highlighter>
				<p>
					To chain <code>validate()</code> with the other steps using <code>and_then</code>, every
					piece has to fail with the <i>same</i> type. So instead of <code>ValidationError</code>,
					lets make each function return an <code>AppError</code>, an enum of every way a request
					can fail:
				</p>
				<Highlighter language="rust">
					{stripIndent`
						enum AppError {
							Validation(ValidationError),
							Database(DatabaseError),
							Network(NetworkError),
						}

						fn validate(request: Request) -> Result<Request, AppError> { /* ... */ }
						fn update(request: Request) -> Result<Record, AppError> { /* ... */ }
						fn send(record: Record) -> Result<Receipt, AppError> { /* ... */ }

						validate(request).and_then(update).and_then(send) // Result<Receipt, AppError>
					`}
				</Highlighter>
				<p>
					Promises in JavaScript kinda look a lot like this! There's a fulfilled track and a
					rejected track, and <code>.then(onFulfilled, onRejected)</code> is a switch between them.
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
				<blockquote className="[quotes:none]">
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
					Remember that <code>.then</code> is simply whatever is defined on the thenable. If the
					thenable is a real promise, the method being called is the one on the prototype,{' '}
					<code>Promise.prototype.then</code>.
				</p>
				<p>
					In our original program, we made the <code>Symbol.species</code> getter throw on the
					Promise constructor. We've also learnt that the engine will call <code>.then()</code> on a
					thenable when you pass one to <code>resolve()</code>. So, naturally, because we saw the
					program crash eventually, we can deduce that <code>Promise.prototype.then</code> is
					somehow eventually calling <code>p.constructor[Symbol.species]</code>, right? But why on
					earth would <code>Promise.prototype.then</code> care about <code>Symbol.species</code>?
				</p>
				<p>
					It cares because <code>.then()</code> returns a <i>new</i> promise, which is what lets you
					chain <code>.then().then()</code>. If you subclass <code>Promise</code>, you'd expect{' '}
					<code>.then()</code> to return an instance of your subclass, not a plain{' '}
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
					and getters can throw!
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
				<p>Drawn as a railway:</p>
				<JobOrder />
				<p>
					Luckily, the fix is simple, and might already be obvious to you! We must create our
					resolve/reject functions before calling <code>.then()</code>, so that we actually have the
					ability to reject the promise if calling <code>.then()</code> throws. Creating the
					resolving functions is just an allocation and allocations can't throw, and once the
					functions exist, the existing error handling rejects the promise like any other failure.
				</p>
				<h2>A promise's failure track has no label</h2>
				<p>So, is a promise a railway?</p>
				<Highlighter language="typescript">
					{stripIndent`
						declare const p: Promise<number>;
					`}
				</Highlighter>
				<p>
					In TypeScript, the <code>Promise&lt;T&gt;</code> interface has only one type parameter and
					offers no way for a developer to express ways in which the promise might reject.
					TypeScript users have asked for a <code>Promise&lt;T, E&gt;</code> to exist since 2015 -
					see this issue:{' '}
					<ExternalLink href="https://github.com/microsoft/TypeScript/issues/6283">
						microsoft/TypeScript#6283
					</ExternalLink>
					! Ron Buckton, who used to work on TypeScript at Microsoft, closed this issue, writing:
				</p>
				<blockquote>
					<p>we cannot guarantee the correct type of the exception at design time.</p>
				</blockquote>
				<p>
					Which, we have now learnt, is true! Earlier, we saw the runtime reject a promise with{' '}
					<code>boom</code>: <code>p.then()</code> read a <code>Symbol.species</code> getter that
					threw, and step c of the job rejected the promise with it, very far away from any userland{' '}
					<code>reject()</code> call! If the spec itself can put values on the reject track, then
					even code that only ever calls <code>reject()</code> with one type cannot be given an{' '}
					<code>E</code>. The failure track has to be <code>any</code> (okay, yes, it could
					technically be <code>unknown</code>, but adoption and backwards compatibility are also
					important things for a project of TypeScript's scope and size to care about!).
				</p>
				<p>Here's that represented as a railway:</p>
				<Railway
					input="resolve(value)"
					steps={['read value.then', 'call value.then']}
					success="T"
					failure="any"
					untypedFailure
				/>
				<p>
					Generally I think engineers who have thought "why doesn't a promise type its rejection?"
					and tried to land on an answer will land on "JavaScript lets you throw anything". It's
					good that engineers will think about these things and try to answer them, and even better
					if they land on this quite logical conclusion. Especially since the real reason is so
					subtle!
				</p>
				<p>
					So, in my opinion, this is the difference between a promise and a railway. Rust's{' '}
					<code>and_then</code> works because each switch in the railway defines its failure type.
					This is unlike promises: <code>.then()</code> cannot define its failure, since the runtime
					can put anything on the rejected track.
				</p>
				<p>Promises are not railways!</p>
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
					In the Gleam source, there's a doc comment above it that says "not generic over the error
					type as any Gleam panic or JavaScript exception could alter the error value", which would
					make it "unsound and untypable". In other words, the failure track is intentionally left
					unlabelled, just like TypeScript.
				</p>
				<p>
					Since the reject track can't be typed, Gleam doesn't use it. Instead, the pattern in Gleam
					is to always hold a <code>Result</code> in the <i>fulfilled</i> track. For example, here
					are two functions with signatures you might see in your Gleam code:
				</p>
				<Highlighter language="gleam">
					{stripIndent`
						// In your userland code:
						fn get_user() -> Promise(Result(User, DatabaseError))

						// Or this builtin function
						pub fn try_await(
							promise: Promise(Result(a, e)),
							callback: fn(a) -> Promise(Result(b, e)),
						) -> Promise(Result(b, e))
					`}
				</Highlighter>
				<p>Can we draw this on train tracks? Yes! But in a slightly different way:</p>
				<Carried />
				<p>
					Gleam's pattern of <code>Promise(Result(a, e))</code> encodes a two-track result onto a
					one-track promise. The promise's own reject track is still there, and still untyped, but
					now it's only ever used for absolute disasters. The <code>try_await</code> function is
					Gleam's version of <code>bind</code> (which we talked about earlier), and with Gleam's{' '}
					<ExternalLink href="https://tour.gleam.run/advanced-features/use/">
						<code>use</code>
					</ExternalLink>{' '}
					syntax, a chain of them reads like normal straight-line code, or code that is on a single
					straight-line train track.
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
					In this example each of the promises are fallible, and every failure is a well-known type,
					and yet nothing ever calls <code>.catch()</code>! You could totally do the same in
					TypeScript by always using a result type in promises:{' '}
					<code>Promise&lt;Result&lt;T, E&gt;&gt;</code>, or with something like{' '}
					<ExternalLink href="https://github.com/supermacro/neverthrow">neverthrow</ExternalLink>
					's <code>ResultAsync</code>.
				</p>
				<p>There is one thing in the way, though.</p>
				<p>
					Unlike TypeScript, <code>gleam_javascript</code> does not even have a <code>.then()</code>
					, or even an equivalent-but-differently-named method anywhere! Instead the continuation
					behaviour is split into two separate methods. These are named map and await:
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
							Note: <code>await</code> is not actually a valid identifier in JavaScript
						</>
					}
				>
					{stripIndent`
						export function map<A, B>(promise: Promise<A>, callback: (value: A) => B): Promise<B>
						export function await<A, B>(promise: Promise<A>, callback: (value: A) => Promise<B>): Promise<B>
					`}
				</Highlighter>
				<p>
					According to these signatures, <code>map</code> never flattens a promise and{' '}
					<code>await</code> flattens exactly once. Both call <code>.then()</code> internally, which
					is a problem for <code>map</code> when the callback returns a promise:
				</p>
				<Highlighter language="typescript">
					{stripIndent`
						const p = Promise.resolve(1);
						const q = map(p, n => Promise.resolve(n + 1));
						// the signature says q is a Promise<Promise<number>>

						await q; // 2, the engine flattened it anyway
					`}
				</Highlighter>
				<p>
					The signature says <code>q</code> is a <code>Promise&lt;Promise&lt;number&gt;&gt;</code>,
					but the engine flattened it, so <code>q</code> actually holds <code>2</code>. Gleam's type
					checker would be wrong about <code>q</code>.
				</p>
				<p>
					This is the problem we touched on earlier: <code>Promise&lt;Promise&lt;T&gt;&gt;</code>{' '}
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
					promises. You might've seen jQuery's deferreds, Q, Bluebird, etc in older, pre-promises
					JavaScript code. The one thing these libraries all had in common was that they all had a{' '}
					<code>.then()</code> method - now we know those objects are called <b>thenable</b>s!
				</p>

				<p>
					To ease the ecosystem into the migration, the team working on the spec decided to allow
					any thenable to interop with another, and thus the behaviour of an outer promise waiting
					on an inner promise (thenable) was decided on.
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
					The flattening behaviour of <code>resolve</code> having to look at the value it was given
					is the cost of this compromise.
				</p>
				<p>
					So, to give <code>map</code> an honest type, <code>gleam_javascript</code> hides the
					promise by wrapping it in an extra layer:
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
				<h2>Back to the bug</h2>
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
