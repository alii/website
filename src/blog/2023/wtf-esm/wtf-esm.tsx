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
		'I recently Tweeted about publishing a dual ESM and CJS package to npm. It got a lot of likes, and here is why that matters.';

	public keywords = ['javascript', 'esm', 'typescript', 'publish', 'package', 'npm', 'node'];

	public render() {
		return (
			<>
				<h1 className="font-serif italic">WTF, ESM!?</h1>

				<p>
					I{' '}
					<ExternalLink href="https://twitter.com/alistaiir/status/1634274673876783120">
						recently Tweeted
					</ExternalLink>{' '}
					about publishing a dual ESM and CJS package to npm. It got a lot of likes, and here is why
					that matters. It's important that you understand that I was wrong in my Tweet, and things
					are arguably easier or more difficult than they seem. This is the current state of
					publishing a JS package.
				</p>

				<h3>Preface</h3>

				<p>
					I am so incredibly grateful for the absolutely wonderful{' '}
					<ExternalLink href="https://twitter.com/atcb">Andrew Branch</ExternalLink>, who took a lot
					of time out of his vacation to correct my Tweet and wrote{' '}
					<ExternalLink href="https://twitter.com/atcb/status/1634653474041503744">
						this excellent thread
					</ExternalLink>
					. A lot of this blog post is regurgitated text of how I interpreted his Tweets.
				</p>

				<p>
					Andrew works on TypeScript itself at Microsoft, specifically on auto imports and modules.
					It's likely he's the only person on the planet who knows exactly how this works inside
					out. It's been rumoured that he will be summoned if you utter "module resolution" three
					times in the dark. Thank you Andy - you're truly a super star ⭐💖
				</p>

				<hr />

				<p>
					Right now, it's extraordinarily clear we are experiencing growing pains in our great
					migration to ECMAScript Modules. Below is the part of my <code>package.json</code> that I
					posted.
				</p>

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
					As mentioned above, I made some mistakes here. First of all, it's important to
					differentiate between what is runtime code that engines will understand (what is
					JavaScript), and what is type definitions (what is TypeScript). This (seems) easy enough,
					we can see clearly that there are two <code>types</code> fields. One is under the{' '}
					<code>.</code> entrypoint for <code>exports</code>, the other is at the root. Let's break
					it down.
				</p>

				<h3>Where did I go wrong?</h3>

				<p>
					It's pretty hard to get a conclusive answer from the "crowd" of JavaScript developers
					about the best way to publish a package to npm. Everyone has conflicting answers &amp; we
					all seem to be following what already exists on GitHub and npm. There are lots of packages
					that are published technically incorrectly but used and installed by millions of people.
					This means a lot of packages follow what I'm calling a colloquial standard. Here's what I{' '}
					<b>*thought to be true*</b>, and so do most other devs...
				</p>

				<Note variant="warning" title="Warning">
					Below is not the correct way to publish a package to npm. This is what I thought was
					correct at the time of Tweeting.
				</Note>

				<ul>
					<li>
						<code>.types</code> at the root is for TypeScript type definitions. A single{' '}
						<code>.d.ts</code> file can define all exported symbols in your package.
					</li>

					<li>
						<code>.main</code> is for CJS before <code>exports</code> existed. You can emit a single
						CJS compatible file that can be consumed by (legacy) runtimes.
					</li>

					<li>
						<code>.module</code> is for an ESM entrypoint before <code>exports</code> existed. This
						was mostly used by bundlers like Webpack, and has never been part of any standard. It's
						superseded by <code>exports</code>, but it might be good to keep in order to support the
						older bundlers.
					</li>

					<li>
						<code>.exports</code> is the new standard for defining entrypoints for your package. It
						is a map of entrypoints to files. The <code>.</code> entrypoint is the default
						entrypoint. We also include <code>./package.json</code> so the package.json file is also
						accessible. The <code>exports</code> field is supported in modern runtimes. Node has
						supported it since v16.0.0 - for this reason, you will see <code>exports</code>{' '}
						sometimes referenced as node16.
					</li>

					<li>
						<code>.exports.*.types</code> is for TypeScript type definitions. A single{' '}
						<code>.d.ts</code> file can define all exported symbols in your package for both CJS and
						ESM.
					</li>

					<li>
						<code>.exports.*.import</code> is for ESM. This is the entrypoint for how a modern
						runtime should import your package when running under CommonJS. It is a single ESM
						compatible file.
					</li>

					<li>
						<code>.exports.*.require</code> is for CJS. This is the entrypoint for how a modern
						runtime should import your package when running under CommonJS. It is a single CJS
						compatible file.
					</li>

					<li>
						<code>.exports.*.default</code> is for when a runtime does not match any other
						condition, and is a fallback. It's also within the spec to specify <code>default</code>{' '}
						as the <b>only</b> entrypoint. I did not use <code>default</code> in my initial Tweet.
					</li>
				</ul>

				<p>
					I made a few mistakes here. First of all, types are specific to ESM and CJS. This means
					there should be <b>two</b> <code>types</code> fields. One for ESM, one for CJS. Even the
					TypeScript documentation gets this wrong, and is something they're working on updating.
					Solutions for this are also pretty wild. I've managed to get things working by simply
					copying <code>./dist/index.d.ts</code> to <code>./dist/index.d.cts</code> after bundling,
					and making the following changes to my <code>package.json</code>.
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

				<p>
					Note that we point to a .js file and not .mjs when targeting ESM. This is because our
					package.json has <code>type</code> set to <code>module</code>. This tells our runtime that
					all files are assumed to be ESM unless they have a <code>.cjs</code> extension. There's no
					such thing as an ESM package, only ESM files. Using <code>"type": "module",</code> is just
					a way to tell the runtime to interpret existing files as ESM.
				</p>

				<h3>What gives?</h3>

				<Note variant="info" title="Note">
					I'm still figuring this all out, and I'm not an expert. I'm just trying to share what I
					have learned so far. If you have any corrections or suggestions, please let me know!
				</Note>

				<p>
					Clearly, this is messy. It's messy because we're trying to support a lot of different
					runtimes, and we're trying to support them all at once. We're trying to support ESM, CJS,
					legacy bundlers, modern bundlers, and TypeScript. We're trying to support all of these
					runtimes at once, and finally, we're trying to support them all at once in a single{' '}
					<code>package.json</code> file. Few other languages suffer from this level of complexity
					and fragmentation.
				</p>

				<p>
					Let's break down the mess and why all these things are the way they are. Starting off with{' '}
					<code>exports</code>.
				</p>

				<p>
					<code>exports</code> is the modern way to define what your package exports. We have
					already established that it is a map of entrypoints to files. Let's step through what
					happens when a runtime/consumer (we'll use the word consumer, because TypeScript - which
					is not a runtime - is also reading our code in this case) wants to import our package.
				</p>

				<ol>
					<li>
						<p>Consumer encounters an import statement</p>

						<Highlighter>
							{stripIndent`
								import {something} from 'my-package';
							`}
						</Highlighter>
					</li>

					<li>
						<p>
							Consumer resolve the source code for <code>my-package</code>. In Node.js this is done
							by looking for the folder name in <code>node_modules</code>, and then finding the{' '}
							<code>package.json</code>. In any case, this is up to the consumer to implement
						</p>
					</li>

					<li>
						<p>
							Consumer finds <code>package.json</code> file in the source code folder, and begins to
							read the <code>exports</code> field
						</p>
					</li>

					<li>
						It steps through each field (in order, despite it being an object) and checks if the
						condition the consumer is looking for exists in the <code>exports</code> field.
					</li>

					<li>
						<p>
							If the condition is met, the consumer will use the file specified in the{' '}
							<code>exports</code> field as the entrypoint for the package. If the condition is not
							met, it will continue to the next field. If no condition is met, a consumer will
							usually exit/throw an error.
						</p>

						<p>
							An example of a condition being met could be Node.js looking for an ESM file. In this
							case, it would look for the <code>import</code> condition first, before trying to fall
							back to <code>default</code> if it exists.
						</p>
					</li>
				</ol>
			</>
		);
	}
}
