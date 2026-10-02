// Turbopack loader that makes Gleam modules Next.js API routes.
//
// Gleam refuses module names like `[platform]` or anything with a hyphen, so a
// route is a pointer file (`src/pages/api/ping.gleam.mjs` holding
// `export * from '../../routes/api/ping.gleam';`). Extra lines in a pointer,
// like `export const dynamic = 'force-static';`, are kept in front of the
// compiled module.
const {execFile} = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROUTE_EXPORTS = ['handle', 'get'];

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

module.exports = function gleamLoader() {
	const callback = this.async();
	const root = this.rootContext;
	const srcDir = path.join(root, 'src');

	// any Gleam source or FFI (`*_ffi.ts`) change must re-run the compiler, not just this file
	for (const file of sources(srcDir)) this.addDependency(file);

	const pointer = fs.readFileSync(this.resourcePath, 'utf8');
	const target = /^export \* from ['"]([^'"]+\.gleam)['"];?\s*$/m.exec(pointer);
	if (!target)
		return callback(
			new Error(
				`${this.resourcePath}: expected a line like export * from '../../routes/api/ping.gleam';`,
			),
		);
	const source = path.resolve(path.dirname(this.resourcePath), target[1]);
	let prelude = pointer.replace(target[0], '').trim();
	if (prelude) prelude += '\n\n';

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
					.filter(name => ROUTE_EXPORTS.includes(name)),
			);

			const runtime = relative(
				path.join(root, 'build/dev/javascript', project, 'next/runtime.mjs'),
			);
			if (exported.has('handle')) {
				code += `\n\nimport * as $$runtime from ${JSON.stringify(runtime)};\nexport default (req, res) => $$runtime.api(handle, req, res);\n`;
			} else if (exported.has('get')) {
				code += `\n\nimport * as $$runtime from ${JSON.stringify(runtime)};\nexport const GET = () => $$runtime.route(get);\n`;
			}

			callback(null, prelude + code);
		})
		.catch(callback);
};
