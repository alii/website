// Turbopack loader that makes `.gleam` files Next.js pages.
//
// Gleam refuses module names like `_app`, `[slug]`, `404` or anything with a
// hyphen, so those pages are a pointer file (`src/pages/_app.gleam.mjs` holding
// `export * from '../routes/app.gleam';`). Extra lines in a pointer, like the
// `globals.css` import, are kept in front of the module: Next only allows that
// import from the `_app` entry itself.
//
// The compiled module is inlined rather than re-exported so that Next's
// server-code stripping sees `getStaticProps` and friends in the entry and can
// drop them, and their imports, from the browser bundle.
const {execFile} = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const PAGE_EXPORTS = ['view', 'props', 'params', 'load', 'paths', 'respond'];

function sources(dir, out = []) {
	for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) sources(full, out);
		else if (/\.gleam$|_ffi\.[cm]?[jt]s$/.test(entry.name)) out.push(full);
	}
	return out;
}

// scripts/ensure-gleam.mjs installs one here when there is none on PATH
function gleamBinary(root) {
	const local = path.join(
		root,
		'node_modules',
		'.bin',
		process.platform === 'win32' ? 'gleam.exe' : 'gleam',
	);
	return process.env.GLEAM_BIN ?? (fs.existsSync(local) ? local : 'gleam');
}

// several pages compile at once; share one `gleam build` between them
let building = null;
function build(root) {
	building ??= new Promise((resolve, reject) => {
		execFile(
			gleamBinary(root),
			['build', '--target', 'javascript'],
			{cwd: root, encoding: 'utf8'},
			(error, stdout, stderr) => {
				building = null;
				if (error?.code === 'ENOENT')
					reject(
						new Error('gleam not found: `brew install gleam` or `node scripts/ensure-gleam.mjs`'),
					);
				else if (error)
					reject(new Error(`gleam build failed:\n${stderr || stdout || error.message}`));
				else resolve();
			},
		);
	});
	return building;
}

const pascal = name => name.replace(/(?:^|[^a-z0-9])([a-z0-9])/gi, (_, c) => c.toUpperCase());

module.exports = function gleamLoader() {
	const callback = this.async();
	const root = this.rootContext;
	const srcDir = path.join(root, 'src');

	// any Gleam source or FFI (`*_ffi.ts`) change must re-run the compiler, not just this file
	for (const file of sources(srcDir)) this.addDependency(file);

	let source = this.resourcePath;
	let prelude = '';
	if (source.endsWith('.gleam.mjs')) {
		const pointer = fs.readFileSync(source, 'utf8');
		const target = /^export \* from ['"]([^'"]+\.gleam)['"];?\s*$/m.exec(pointer);
		if (!target)
			return callback(
				new Error(`${source}: expected a line like export * from '../routes/app.gleam';`),
			);
		source = path.resolve(path.dirname(source), target[1]);
		prelude = pointer.replace(target[0], '').trim();
		if (prelude) prelude += '\n\n';
	}

	build(root)
		.then(() => {
			const project = /^name\s*=\s*"([^"]+)"/m.exec(
				fs.readFileSync(path.join(root, 'gleam.toml'), 'utf8'),
			)[1];
			const moduleName = path.relative(srcDir, source).replace(/\.gleam$/, '');
			const compiled = path.join(root, 'build/dev/javascript', project, `${moduleName}.mjs`);
			const here = path.dirname(this.resourcePath);
			const relative = target => {
				const rel = path.relative(here, target).split(path.sep).join('/');
				return rel.startsWith('.') ? rel : `./${rel}`;
			};

			let code = fs.readFileSync(compiled, 'utf8');

			code = code.replace(
				/(\bfrom\s+)"(\.{1,2}\/[^"]+)"/g,
				(_, from, spec) =>
					`${from}${JSON.stringify(relative(path.resolve(path.dirname(compiled), spec)))}`,
			);

			const exported = new Set(
				[...code.matchAll(/^export function ([a-z_][a-z0-9_]*)\b/gm)]
					.map(m => m[1])
					.filter(name => PAGE_EXPORTS.includes(name)),
			);

			// a Gleam module imported from TS is not a page: leave it as it is
			if (exported.has('view')) {
				// The data functions must not be exports: Next strips getStaticProps and
				// friends (and whatever only they reference) from the browser bundle, but
				// it keeps every other export, server-only imports and all.
				for (const name of ['load', 'paths', 'params', 'respond']) {
					code = code.replace(new RegExp(`^export function ${name}\\b`, 'm'), `function ${name}`);
				}
				const runtime = relative(
					path.join(root, 'build/dev/javascript', project, 'next/runtime.mjs'),
				);
				const component = `${pascal(path.basename(moduleName))}Page`;
				const glue = [`import * as $$runtime from ${JSON.stringify(runtime)};`];
				if (exported.has('respond')) {
					glue.push(
						'export const getServerSideProps = context => $$runtime.server_props(respond, props(), context);',
					);
				}
				if (exported.has('load')) {
					glue.push(
						exported.has('params')
							? 'export const getStaticProps = context => $$runtime.static_props(load, params(), props(), context);'
							: 'export const getStaticProps = context => $$runtime.static_props_without_params(load, props(), context);',
					);
				}
				if (exported.has('paths')) {
					glue.push('export const getStaticPaths = () => $$runtime.static_paths(paths, params());');
				}
				glue.push(
					exported.has('props')
						? `export default function ${component}(raw) {\n\treturn $$runtime.render(view, props(), raw);\n}`
						: `export default function ${component}(raw) {\n\treturn view(raw);\n}`,
				);
				code += `\n\n${glue.join('\n')}\n`;
			}

			callback(null, prelude + code);
		})
		.catch(callback);
};
