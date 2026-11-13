import {stripIndent} from 'common-tags';
import Link from 'next/link';
import {Carried} from '../../../components/diagrams/carried';
import {ExternalLink} from '../../../components/external-link';
import {Highlighter} from '../../../components/syntax-highligher';
import {Trace} from '../../../components/diagrams/trace';
import {Post} from '../../Post';

export class GleamPromises extends Post {
	public name = 'Typed errors on JavaScript promises, with Gleam';
	public slug = 'gleam-promises';
	public date = new Date('2026-11-12');
	public hidden = true;
	public keywords = ['javascript', 'promises', 'gleam', 'typescript', 'result types'];
	public excerpt =
		'How Gleam gets typed errors out of JavaScript promises, and why promises flatten';

	public render() {
		return (
			<>
				<p>
					In <Link href="/thenables">my last post</Link>, I fixed a WebKit bug and asked whether
					promises are railways. They nearly are, but a promise&apos;s failure track can&apos;t be
					typed, because the engine can put its own errors on it. TypeScript&apos;s{' '}
					<code>Promise&lt;T&gt;</code> has no error type for exactly this reason.
				</p>
				<p>
					TypeScript had to add types to JavaScript after the fact, so maybe it just inherited the
					problem. What would a language that has typed errors from day one do, if it still had to
					run on JavaScript&apos;s promises?
				</p>
				<p>
					That&apos;s the question for this post. We want promises with errors we can name in the
					types. Promises get in the way twice. First, the reject track can&apos;t be labelled.
					Second, promises flatten. Let&apos;s take them one at a time.
				</p>
				<h2>Typed errors</h2>
				<p>
					Gleam is one of those languages. You might have seen me talk about{' '}
					<ExternalLink href="https://gleam.run">Gleam</ExternalLink> before. It's really good, and
					I write lots of it. Don't worry if you've never read any; I'll put TypeScript next to the
					Gleam as we go. It is a typed language that compiles to the BEAM and to{' '}
					<ExternalLink href="https://gleam.run/news/v0.16-gleam-compiles-to-javascript/">
						JavaScript
					</ExternalLink>
					, which is how <Link href="/gleam-bun-apps">an earlier post</Link> built Bun executables
					from it. It's almost impossible to write modern JavaScript without eventually handling
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
				<p>Very simple! And look, just like TypeScript, there's no error type parameter.</p>
				<p>
					In the Gleam source, there's a doc comment above it that says "not generic over the error
					type as any Gleam panic or JavaScript exception could alter the error value", which would
					make it "unsound and untypable". In other words, the failure track is intentionally left
					unlabelled, just like TypeScript.
				</p>
				<p>
					Since the reject track can't be typed, Gleam doesn't use it. Instead, the pattern in Gleam
					is to always hold a <code>Result</code> in the <i>fulfilled</i> track. For example, here
					is a function signature you might see in your Gleam code:
				</p>
				<Highlighter language="gleam">
					{stripIndent`
						fn get_user() -> Promise(Result(User, DatabaseError))
					`}
				</Highlighter>
				<p>
					Gleam writes type parameters with parentheses instead of angle brackets, so in TypeScript
					that would be:
				</p>
				<Highlighter language="typescript">
					{stripIndent`
						function getUser(): Promise<Result<User, DatabaseError>>
					`}
				</Highlighter>
				<p>Can we draw this on train tracks? Yes! But in a slightly different way:</p>
				<Carried />
				<p>
					Gleam's pattern of <code>Promise(Result(a, e))</code> encodes a two-track result onto a
					one-track promise. The promise's own reject track is still there, and still untyped, but
					now it's only ever used for absolute disasters.
				</p>
				<p>
					The <code>try_await</code> function is Gleam's version of binding.
				</p>
				<Highlighter language="gleam">
					{stripIndent`
						pub fn try_await(
							promise: Promise(Result(a, e)),
							callback: fn(a) -> Promise(Result(b, e)),
						) -> Promise(Result(b, e))
					`}
				</Highlighter>
				<p>
					Sorry if this syntax looks a bit new and scary. The lowercase letters are how Gleam
					represents type-parameters. Below is the equivalent TypeScript to help you understand and
					translate:
				</p>
				<Highlighter language="typescript">
					{stripIndent`
						function tryAwait<A, B, E>(
							promise: Promise<Result<A, E>>,
							callback: (value: A) => Promise<Result<B, E>>,
						): Promise<Result<B, E>>
					`}
				</Highlighter>
				<p>
					With Gleam's{' '}
					<ExternalLink href="https://tour.gleam.run/advanced-features/use/">
						<code>use</code>
					</ExternalLink>{' '}
					syntax, a chain of them reads like normal straight-line code, or code that is on a single
					straight-line train track. Each <code>use x &lt;- promise.try_await(...)</code> line is a
					bit like <code>const x = await ...</code>, except it stops early on an <code>Error</code>{' '}
					instead of throwing:
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
					In this example each of the promises are fallible and every failure is a well-known type,
					yet nothing ever calls <code>.catch()</code>! You could totally do the same in TypeScript
					by always using a result type in promises: <code>Promise&lt;Result&lt;T, E&gt;&gt;</code>,
					or with something like{' '}
					<ExternalLink href="https://github.com/supermacro/neverthrow">neverthrow</ExternalLink>
					's <code>ResultAsync</code>.
				</p>
				<p>
					So that's the first problem solved: typed errors ride on the fulfilled track, and the
					reject track is left for disasters.
				</p>
				<h2>Promises can't hold promises</h2>
				<p>
					Now for the second problem. To keep its types honest, a language also needs to know
					exactly what a promise will hand back. Flattening makes that harder than it sounds.
				</p>
				<p>
					Unlike TypeScript, <code>gleam_javascript</code> does not offer a way to call{' '}
					<code>.then()</code>, and not even an equivalent-but-differently-named method! Instead the
					continuation behaviour is split into two separate methods. These are named map and await:
				</p>
				<Highlighter language="gleam">
					{stripIndent`
						pub fn map(promise: Promise(a), callback: fn(a) -> b) -> Promise(b)
						pub fn await(promise: Promise(a), callback: fn(a) -> Promise(b)) -> Promise(b)
					`}
				</Highlighter>
				<p>Or in TypeScript:</p>
				<Highlighter language="typescript">
					{stripIndent`
						function promiseMap<A, B>(promise: Promise<A>, callback: (value: A) => B): Promise<B>
						function promiseAwait<A, B>(promise: Promise<A>, callback: (value: A) => Promise<B>): Promise<B>
					`}
				</Highlighter>
				<p>
					The only difference is the callback's return type. <code>map</code>'s callback returns any{' '}
					<code>B</code>, and <code>await</code>'s callback returns a <code>Promise&lt;B&gt;</code>.
				</p>
				<p>
					According to these signatures, <code>map</code> will never flatten a promise and{' '}
					<code>await</code> will flatten exactly once. Both call <code>.then()</code> internally,
					which is a problem for <code>map</code> when the callback returns a promise.
				</p>
				<p>
					Let's try to implement a naive version of Gleam's <code>promise.map</code> function:
				</p>
				<Highlighter language="javascript">
					{stripIndent`
						// a very naive map: just .then()
						const map = (promise, callback) => promise.then(callback);

						const q = map(Promise.resolve(1), n => Promise.resolve(n + 1));
						await q; // 2, the engine flattened it
					`}
				</Highlighter>
				<p>
					The signature says <code>q</code> is a <code>Promise(Promise(Int))</code>, but the engine
					flattened it, so <code>q</code> actually holds <code>2</code>. Gleam's type checker would
					be wrong about <code>q</code>! Anything that trusts that type will crash, because{' '}
					<code>map</code> tries to call <code>.then()</code> on a value that is actually{' '}
					<code>2</code>:
				</p>
				<Highlighter language="gleam">
					{stripIndent`
						use inner <- promise.await(q)     // inner: Promise(Int), says the compiler
						promise.map(inner, int.to_string) // TypeError: promise.then is not a function
					`}
				</Highlighter>
				<p>
					This is the problem from the last post: <code>Promise&lt;Promise&lt;T&gt;&gt;</code>{' '}
					cannot be constructed because, remember, if you resolve a promise with another promise
					then we just wait for that second promise instead.
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
				<p>
					TypeScript decided to tackle this problem the other way and instead of <i>stopping</i> the
					flattening, they made the type system understand flattening.
				</p>
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
				<h2>What did we learn?</h2>
				<p>Let's summarise!</p>
				<ul>
					<li>
						A promise&apos;s reject track can&apos;t be typed, so Gleam&apos;s{' '}
						<code>Promise(value)</code> has no error type, just like TypeScript&apos;s.
					</li>
					<li>
						Instead, Gleam puts a <code>Result</code> on the fulfilled track, and{' '}
						<code>try_await</code> chains them like binding on a railway.
					</li>
					<li>
						Promises flatten because of 2013 thenable interop, so{' '}
						<code>Promise&lt;Promise&lt;T&gt;&gt;</code> can&apos;t exist. Gleam works around this
						with a <code>PromiseLayer</code> class that hides the inner promise from the engine.
					</li>
				</ul>
			</>
		);
	}
}
