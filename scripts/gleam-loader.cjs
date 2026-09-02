// Lets `.gleam` files be Next.js pages (and be imported from TS/TSX).
//
// Gleam compiles the whole project with `gleam build` into build/dev/javascript,
// one ES module per Gleam module, with named snake_case exports only. Next wants
// a default export and camelCase names like `getStaticProps`. So for a .gleam
// file we run the compiler, take the compiled module, point its relative imports
// back at the build directory, rename the exports Next looks for, and add a
// default export. Inlining (rather than re-exporting) matters: Next's SSG
// transform strips `getStaticProps` and the imports only it used out of the
// browser bundle, and it can only do that when they are in the page module.
const {execFile} = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const NAMES = {
	get_static_props: 'getStaticProps',
	get_static_paths: 'getStaticPaths',
	get_server_side_props: 'getServerSideProps',
	get_initial_props: 'getInitialProps',
	// app router route handlers
	get: 'GET',
	post: 'POST',
	put: 'PUT',
	patch: 'PATCH',
	delete: 'DELETE',
	head: 'HEAD',
	options: 'OPTIONS',
};

// `pub fn page(props)` becomes the default export
const DEFAULT = 'page';

function sources(dir, out = []) {
	for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) sources(full, out);
		else if (/\.(gleam|mjs)$/.test(entry.name)) out.push(full);
	}
	return out;
}

// several pages compile at once; share one `gleam build` between them
let building = null;
function build(root) {
	building ??= new Promise((resolve, reject) => {
		execFile('gleam', ['build', '--target', 'javascript'], {cwd: root, encoding: 'utf8'}, (error, stdout, stderr) => {
			building = null;
			if (error) reject(new Error(`gleam build failed:\n${stderr || stdout || error.message}`));
			else resolve();
		});
	});
	return building;
}

const pascal = name => name.replace(/(?:^|[^a-z0-9])([a-z0-9])/gi, (_, c) => c.toUpperCase());

module.exports = function gleamLoader() {
	const callback = this.async();
	const root = this.rootContext;
	const srcDir = path.join(root, 'src');

	// any Gleam source or FFI change must re-run the compiler, not just this file
	for (const file of sources(srcDir)) this.addDependency(file);

	build(root)
		.then(() => {
			const project = /^name\s*=\s*"([^"]+)"/m.exec(fs.readFileSync(path.join(root, 'gleam.toml'), 'utf8'))[1];
			const moduleName = path.relative(srcDir, this.resourcePath).replace(/\.gleam$/, '');
			const compiled = path.join(root, 'build/dev/javascript', project, `${moduleName}.mjs`);
			const here = path.dirname(this.resourcePath);
			const relative = target => {
				const rel = path.relative(here, target).split(path.sep).join('/');
				return rel.startsWith('.') ? rel : `./${rel}`;
			};

			let code = fs.readFileSync(compiled, 'utf8');

			code = code.replace(
				/(\bfrom\s+)"(\.{1,2}\/[^"]+)"/g,
				(_, from, spec) => `${from}${JSON.stringify(relative(path.resolve(path.dirname(compiled), spec)))}`,
			);

			const exported = [...code.matchAll(/^export (?:function|const) ([A-Za-z0-9_$]+)/gm)].map(m => m[1]);

			for (const name of exported) {
				const target = NAMES[name];
				if (target && target !== name) code = code.replace(new RegExp(`\\b${name}\\b`, 'g'), target);
			}

			if (exported.includes(DEFAULT)) {
				const component = pascal(path.basename(moduleName)) || 'Page';
				code += `\n\nexport default function ${component}(props) {\n\treturn ${DEFAULT}(props);\n}\n`;
			}

			callback(null, code);
		})
		.catch(callback);
};
