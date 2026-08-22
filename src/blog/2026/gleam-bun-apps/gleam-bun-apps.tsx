import {stripIndent} from 'common-tags';
import {ExternalLink} from '../../../components/external-link';
import {Highlighter, Shell} from '../../../components/syntax-highligher';
import {Post} from '../../Post';

export class GleamBunApps extends Post {
	public name = 'Single file apps with Gleam and Bun';
	public slug = 'gleam-bun-apps';
	public date = new Date('21 Aug 2026');
	public hidden = false;
	public keywords = ['gleam', 'bun', 'single file executables', 'javascript'];
	public excerpt = 'Build single file executables in Gleam, bundled and run with Bun';

	public render() {
		return (
			<>
				<p>
					<ExternalLink href="https://gleam.run/">Gleam</ExternalLink> is a friendly language
					primarily used for writing fault-tolerant and often distributed systems. It implements a
					Hindley-Milner type system, which is a type system that allows for maximum type-safety
					without sacrificing productivity. Most users of Gleam choose to run it in the BEAM, which
					is the same fantastic Virtual Machine that Elixir and Erlang run in. Basically, Gleam is
					really very good.
				</p>
				<p>
					<ExternalLink href="https://bun.com">Bun</ExternalLink>, which I work on, has support for{' '}
					<ExternalLink href="https://bun.com/docs/bundler/executables">
						Single File Executables
					</ExternalLink>
					. This feature of Bun's bundler enables bundling your code with the runtime itself, into a
					single binary as output. These binaries are completely standalone and do not require your
					end user to have any extra packages installed on their system. They can be cross-compiled
					and you can target both glibc and musl on Linux. Basically, Bun single file executables
					are really very good.
				</p>
				<p>So how can we combine these two really very good things?</p>
				<h2>Writing our program</h2>
				<p>
					Conveniently, Gleam has a JavaScript backend. That means that, as well as targeting the
					BEAM, Gleam can also output JavaScript. Frameworks like{' '}
					<ExternalLink href="https://github.com/lustre-labs/lustre">Lustre</ExternalLink> use this
					to let you write full-stack apps with Gleam that run in browsers, while libraries like{' '}
					<ExternalLink href="https://gossamer.hexdocs.pm/">gossamer</ExternalLink> provide
					idiomatic Gleam bindings to JavaScript APIs that exist in our runtime(s) such as{' '}
					<code>fetch()</code>, <code>crypto</code>, <code>Worker</code>, <code>URL</code>, etc.
				</p>
				<p>
					So, if we want to use Bun's single file executable feature but author our program in
					Gleam, it is precisely writing idiomatic Gleam bindings for APIs that exist in our
					JavaScript runtime that we are interested in.
				</p>
				<p>Here's a quick and dirty example that exposes two of Bun's APIs to Gleam:</p>
				<Highlighter filename="src/bun_ffi.mjs" language="javascript">
					{stripIndent`
						// Bun.file(path).text() -> Promise<string>
						export function readText(path) {
							return Bun.file(path).text();
						}

						// Bun.semver.satisfies(version, range) -> boolean
						export function semverSatisfies(version, range) {
							return Bun.semver.satisfies(version, range);
						}
					`}
				</Highlighter>
				<Highlighter filename="src/app.gleam" language="gleam">
					{stripIndent`
						import gleam/io
						import gleam/javascript/promise.{type Promise}

						@external(javascript, "./bun_ffi.mjs", "readText")
						fn read_text(path: String) -> Promise(String)

						@external(javascript, "./bun_ffi.mjs", "semverSatisfies")
						fn semver_satisfies(version: String, range: String) -> Bool

						pub fn main() {
							use version <- promise.map(read_text("./VERSION"))
							case semver_satisfies(version, "^2.0.0") {
								True -> io.println("v" <> version <> " is compatible")
								False -> io.println("v" <> version <> " needs migrating")
							}
						}
					`}
				</Highlighter>
				<p>
					Don't worry if you are unfamiliar with the Gleam code above. The most important lines are
					those with{' '}
					<ExternalLink href="https://gleam.run/documentation/externals/#JavaScript-externals">
						<code>@external</code>
					</ExternalLink>{' '}
					attributes. This is syntax for telling the Gleam compiler that X function will exist at
					runtime, accepting Y arguments, returning Z value, but the implementation lives{' '}
					<i>somewhere else</i>. These types are not checked, so it's on the developer to make sure
					they are correct. In our case, the implementation lives in a separate JavaScript file on
					the disk, which relative to the Gleam file is <code>./bun_ffi.mjs</code>.
				</p>
				<p>We can run this code with the Gleam CLI itself, with two extra flags.</p>
				<Shell hasDollarOnFirstLineOnly>
					{stripIndent`
						gleam run --target=javascript --runtime=bun
						Downloading packages
						 Downloaded 2 packages in 0.01s
						  Compiling gleam_stdlib
						  Compiling gleam_javascript
						  Compiling app
						   Compiled in 0.03s
						    Running app.main
						v2.1.0 is compatible
					`}
				</Shell>
				<p>
					Nice! We just called some Bun APIs from our Gleam code, and even dealt with promises in
					the process! This is great, but there are two problems:
				</p>
				<p>To run our program...</p>
				<ol>
					<li>...we need both Gleam and Bun installed...</li>
					<li>...and we need the original source code.</li>
				</ol>
				<p>
					This, of course, is a very unfriendly user experience and makes it virtually impossible to
					distribute our application in any way that a normal user (or even developer) would expect.
				</p>
				<h2>Building our program</h2>
				<p>
					We've been using <code>gleam run</code>, which is fine while we're exploring, but it's
					strange to run our app just to generate build artifacts. Instead, Gleam provides us with a{' '}
					<code>gleam build</code> command.
				</p>
				<Shell hasDollarOnFirstLineOnly>
					{stripIndent`
						gleam build --target=javascript
						   Compiled in 0.00s
					`}
				</Shell>
				<p>
					Note that <code>--runtime=bun</code> is gone, since it's a <code>gleam run</code> flag
					only. It only ever told Gleam which runtime it should shell out to, and the JavaScript it
					emits is identical anyway.
				</p>
				<p>
					Gleam just created a <code>build/dev/javascript/</code> directory. The contents are
					nothing exotic - it's simply JavaScript. In fact, Gleam's JavaScript backend generates
					extremely human-readable and modern JavaScript, even using ECMAScript Modules (ESM). This
					is great!
				</p>
				<p>
					Our <code>src/app.gleam</code> compiled to <code>build/[..]/app.mjs</code>, which exports
					our <code>main</code> function but doesn't call it. So, we can write a small entrypoint
					that does:
				</p>
				<Highlighter filename="entry.mjs" language="javascript">
					{stripIndent`
						import {main} from "./build/dev/javascript/app/app.mjs";
						main();
					`}
				</Highlighter>
				<p>Which we can run with Bun, directly:</p>
				<Shell hasDollarOnFirstLineOnly>
					{stripIndent`
						bun entry.mjs
						v2.1.0 is compatible
					`}
				</Shell>
				<p>It works! Amazing.</p>
				<p>
					So... instead of running that entrypoint directly, what if we hand it to Bun's bundler and
					ask for a binary?
				</p>
				<Shell hasDollarOnFirstLineOnly>
					{stripIndent`
						bun build --compile entry.mjs --outfile dist/app
						   [4ms]  bundle  23 modules
						  [58ms] compile  dist/app
					`}
				</Shell>
				<p>
					That command generates a <code>dist/app</code> single file executable. You can copy it
					onto a machine without Gleam or Bun installed, and without any of the source code, and it
					will still run just fine. It's entirely self-contained and standalone. Both of the
					problems we had earlier are gone. We have made our Gleam program much easier to
					distribute!
				</p>
				<p>
					Recall that our <code>@external</code> attributes pointed at <code>./bun_ffi.mjs</code>,
					relative to the Gleam file. When Gleam compiled our program, it copied that file into{' '}
					<code>build/dev/javascript/app/</code>, right next to the <code>app.mjs</code> it
					generated. The relative import still resolves, so Bun's bundler just follows it the same
					way it would follow any import in any other project. Bun sees ECMAScript Modules with a
					relative import, and bundles them, and it has no idea that Gleam was even involved at any
					point!
				</p>
				<p>
					And because that output is an ordinary Bun executable, the rest of the bundler is still
					available to us. We can cross-compile from a Mac straight to a Linux ELF:
				</p>
				<Shell hasDollarOnFirstLineOnly>
					{stripIndent`
						bun build --compile --target=bun-linux-x64 entry.mjs --outfile dist/app-linux
						   [4ms]  bundle  23 modules
						  [58ms] compile  dist/app-linux bun-linux-x64-v1.4.0
					`}
				</Shell>
				<p>
					There are targets for Linux, macOS and Windows, on both x64 and arm64, and on Linux you
					can pick glibc or musl. If it hasn't already, Bun will download the runtime for whichever
					target you asked for, so the first cross-compile is slightly slower than the rest.
				</p>
				<p>
					That's it - only two commands - a Gleam build and then a Bun build. This also works in a
					fresh checkout because Gleam will install missing dependencies during{' '}
					<code>gleam build</code>.
				</p>
				<p>
					I'll soon write a Part II post about how we can take this a step further, and write
					desktop apps with Gleam. In short, you could probably imagine what using Gleam's
					JavaScript target with bindings to frameworks like Electron might look like.
				</p>
				<p>Happy shipping.</p>
			</>
		);
	}
}

// PATH=~/.bun/pr:$PATH gleam dev
