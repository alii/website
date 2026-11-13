import {stripIndent} from 'common-tags';
import {JobOrder} from '../../../components/diagrams/job-order';
import {Railway} from '../../../components/diagrams/railway';
import {ResolveFlow} from '../../../components/diagrams/resolve-flow';
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

export class Thenables extends Post {
	public name = 'Fixing a WebKit bug to see if promises are made of train tracks';
	public slug = 'thenables';
	public date = new Date('2026-11-12');
	public hidden = false;
	public keywords = [
		'javascript',
		'promises',
		'webkit',
		'javascriptcore',
		'railway oriented programming',
		'typescript',
	];
	public excerpt = 'An in-depth explanation of promises in JavaScript, while fixing a WebKit bug';

	public render() {
		return (
			<>
				<p>Here is a program that, until July, never finished in Bun or Safari.</p>
				<Highlighter filename="never.mjs" language="javascript">
					{demo}
				</Highlighter>
				<p>
					Don't worry if this looks confusing. The JavaScript spec says that because the getter
					throws an error, then <code>await p</code> should also throw, and so the program should
					crash. Node.js does, but Safari 26 and Bun 1.3.14 print <code>'before'</code>, report the
					error, and then hang.
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
					never settled! It is neither fulfilled nor rejected, so it stays pending forever. This was{' '}
					<ExternalLink href="https://bugs.webkit.org/show_bug.cgi?id=318399">
						WebKit bug 318399
					</ExternalLink>
					. I fixed it in{' '}
					<ExternalLink href="https://github.com/WebKit/WebKit/pull/68749">
						WebKit/WebKit#68749
					</ExternalLink>
					, and the fix was only +16 lines!
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
					passed (with the exception that if <code>value</code> is a promise, and has a{' '}
					<code>.constructor</code> property equal to <code>Promise</code>, it is returned as is). A
					simple userland implementation would look like this:
				</p>
				<Highlighter filename="promise-resolve.js" language="javascript">
					{stripIndent`
						function PromiseDotResolve(value) {
							if (value instanceof Promise && value.constructor === Promise) {
								return value;
							}

							return new Promise(resolve => resolve(value));
						}
					`}
				</Highlighter>
				<p>
					The same is also true for literally writing <code>await 42</code>. The engine creates a
					promise and immediately calls <code>resolve(42)</code>, just like{' '}
					<code>Promise.resolve()</code> does, and the same exception applies.
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
					wrong! Once <code>resolve</code> has been called the promise is <b>locked-in</b> to an
					outcome, but it can absolutely still be pending:
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
					In statically typed programming languages, implementations of a <code>Result</code> type
					will usually accept <b>two type parameters</b>, the success type and the failure type, one
					per track. For example in Rust you could imagine a <code>validate</code> function's
					signature being:
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
				<Railway
					input="promise"
					steps={['.then(validate)', '.then(update)', '.then(send)']}
					success="fulfilled"
					failure="rejected"
					train={1}
				/>
				<h2>The job</h2>
				<p>
					As a reminder, here's that <b>resolve procedure</b> diagram again:
				</p>
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
				<p>Here's the important line of our program again:</p>
				<Highlighter language="javascript">
					{stripIndent`
						p.constructor = {
							get [Symbol.species]() {
								throw new Error("boom");
							},
						};
					`}
				</Highlighter>
				<p>
					We only changed <code>p</code> here, so the global <code>Promise</code> is untouched.
				</p>
				<p>
					Remember the exception from earlier? When you <code>await</code> a real promise whose{' '}
					<code>constructor</code> is <code>Promise</code> (which, by default, is true for all
					promises), the engine takes a shortcut and waits on that promise directly. We just
					replaced <code>p.constructor</code>, meaning we cannot take the shortcut. Instead, the
					engine treats <code>p</code> in <code>await p</code> like any other value: it makes a
					fresh promise and calls <code>resolve(p)</code> on it.
				</p>
				<p>
					<code>p</code> has a <code>.then()</code>, so it is a thenable, so <code>resolve(p)</code>{' '}
					calls <code>p.then(resolve, reject)</code>. Now, we saw our program crash, so{' '}
					<code>Promise.prototype.then</code> must somehow eventually be accessing{' '}
					<code>p.constructor[Symbol.species]</code>, right? But why on earth would{' '}
					<code>.then()</code> care about a <code>Symbol.species</code> getter?
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
					<code>this.constructor</code> and then by reading <code>constructor[Symbol.species]</code>{' '}
					(the spec calls this step{' '}
					<ExternalLink href="https://tc39.es/ecma262/#sec-speciesconstructor">
						<code>SpeciesConstructor</code>
					</ExternalLink>
					). Both are ordinary property reads and, as we found out, property reads can run getters,
					and getters can throw!
				</p>
				<p>
					This is precisely what our original program at the beginning does! We made{' '}
					<code>p.constructor</code> have a <code>Symbol.species</code> getter that throws, so{' '}
					<code>p.then(resolve, reject)</code> throws during the species lookup, before it has
					stored <code>resolve</code> and <code>reject</code> as callbacks. Recall that Step C of{' '}
					<code>NewPromiseResolveThenableJob</code> makes the engine reject the promise if calling{' '}
					<code>.then()</code> throws - this is the spec-correct behaviour we saw in V8/Node.js.
				</p>
				<p>So why do Safari and Bun hang instead of rejecting the promise?</p>
				<p>
					JavaScriptCore had a fast path for the most-common case where the thenable is a real,
					normal promise, and that fast path did the species lookup <i>first</i>, only creating the
					resolve/reject functions afterwards. When the lookup threw (like how our program does),
					the resolving functions didn't exist yet, so there was nothing to reject with. The
					exception escaped the job entirely (that's the red <code>Error: boom</code> in the
					inspector) and our promise stayed pending forever.
				</p>
				<p>Here's that as a railway:</p>
				<JobOrder />
				<p>
					Our train had effectively derailed! We didn't even get the chance to finish our journey on
					either track and so the original program hung because the train never even arrived at the
					station!
				</p>
				<p>
					Luckily, the fix is simple, and might already be obvious to you! We must create our
					resolve/reject functions before calling <code>.then()</code>, so that we actually have the
					ability to reject the promise if calling <code>.then()</code> throws. Creating the
					resolving functions is just an allocation and allocations can't throw, and once the
					functions exist, the existing error handling rejects the promise just like any other
					failure would.
				</p>
				<p>
					With the two steps in the right order, Bun 1.4 and Safari 27 now behave like the spec, and
					like Node:
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
					Bug fixed! But it left me with a question. Earlier I drew promises as railways, with a
					fulfilled track and a rejected track. However, we just watched the engine put an error on
					the rejected track that no line of our code ever passed to <code>reject()</code>. So does
					that mean we can't actually ever know what's on that track?
				</p>
				<h2>So is a promise a railway?</h2>
				<p>
					In TypeScript, the <code>Promise&lt;T&gt;</code> interface has only one type parameter and
					offers no way for a developer to express ways in which the promise might reject:
				</p>
				<Highlighter language="typescript">
					{stripIndent`
						declare const p: Promise<number>;
					`}
				</Highlighter>
				<p>
					TypeScript users have asked for a <code>Promise&lt;T, E&gt;</code> to exist since 2015 -
					see this issue:{' '}
					<ExternalLink href="https://github.com/microsoft/TypeScript/issues/6283">
						microsoft/TypeScript#6283
					</ExternalLink>
					! Ron Buckton, who used to work on TypeScript at Microsoft, closed this issue, stating:
				</p>
				<blockquote>
					<p>we cannot guarantee the correct type of the exception at design time.</p>
				</blockquote>
				<p>
					Which we have now learnt is true! Earlier, we saw the runtime reject a promise with{' '}
					<code>boom</code>: <code>p.then()</code> read a <code>Symbol.species</code> getter that
					threw the error, and Step C of the job rejected the promise with it, very far away from
					any userland <code>reject()</code> call! If the spec itself can put values on the reject
					track, then even code that only ever calls <code>reject()</code> with one type cannot be
					given an <code>E</code>. The failure track has to be <code>any</code> (okay, yes, it could
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
					Look - we have no control over that failure track! This means we <i>can</i> draw promises
					as railways but it's a bit less useful than a real result type, like Rust's.
				</p>
				<h2>What did we learn?</h2>
				<p>Let's summarise!</p>
				<ul>
					<li>
						<code>resolve(value)</code> does not immediately fulfil a promise. It reads{' '}
						<code>value.then</code> first, and if that is a function the promise follows{' '}
						<code>value</code> instead.
					</li>
					<li>"Resolved" is not a state because a resolved promise can still be pending.</li>
					<li>
						Reading <code>value.then</code>, and reading <code>constructor[Symbol.species]</code>{' '}
						inside <code>Promise.prototype.then</code>, are ordinary property reads. Getters can
						throw, and the spec puts whatever they throw on the rejected track.
					</li>
					<li>
						JavaScriptCore did the species read before creating the resolving functions, so when it
						threw there was nothing to reject with. The fix (
						<ExternalLink href="https://github.com/WebKit/WebKit/pull/68749">
							WebKit/WebKit#68749
						</ExternalLink>
						) was to create the functions first and call them when the getter throws.
					</li>
					<li>
						A promise has the shape of a railway, but its failure track can't be labelled, because
						the engine shares it with you. That is why TypeScript's <code>Promise&lt;T&gt;</code>{' '}
						has no <code>E</code>.
					</li>
				</ul>
				<br />
				<p>
					If you read all the way to the end, then I am glad you are as excited about promises as I
					am. Thank you very much for reading!
				</p>
				<br />
				<div className="text-xs">
					<p>
						Thank you to <ExternalLink href="https://x.com/landon_xyz">Landon Boles</ExternalLink>,{' '}
						<ExternalLink href="https://x.com/fat">Jacob Thornton</ExternalLink> and{' '}
						<ExternalLink href="https://x.com/amadeus">Amadeus Demarzi</ExternalLink>, who all
						helped me review a draft of this post.
					</p>
				</div>
			</>
		);
	}
}
