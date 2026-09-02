// Makes sure a `gleam` compiler exists for scripts/gleam-loader.cjs.
//
// Locally you most likely have one already (`brew install gleam`). Build
// machines such as Vercel do not, so this downloads the release binary into
// node_modules/.bin, which is on PATH for package scripts and is cached
// between deploys.
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const VERSION = process.env.GLEAM_VERSION ?? '1.18.0';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const binDir = process.env.GLEAM_INSTALL_DIR ?? path.join(root, 'node_modules', '.bin');
const installed = path.join(binDir, process.platform === 'win32' ? 'gleam.exe' : 'gleam');

function version(binary) {
	try {
		return execFileSync(binary, ['--version'], {
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'ignore'],
		}).trim();
	} catch {
		return null;
	}
}

if (version(installed)?.includes(VERSION)) {
	console.log(`gleam ${VERSION} already installed in ${binDir}`);
	process.exit(0);
}

const onPath = version('gleam');
if (onPath && !process.env.GLEAM_FORCE_DOWNLOAD) {
	console.log(`using ${onPath} from PATH`);
	process.exit(0);
}

const targets = {
	'darwin-arm64': 'aarch64-apple-darwin',
	'darwin-x64': 'x86_64-apple-darwin',
	'linux-arm64': 'aarch64-unknown-linux-musl',
	'linux-x64': 'x86_64-unknown-linux-musl',
};
const target = targets[`${process.platform}-${process.arch}`];
if (!target) {
	console.error(
		`no gleam download for ${process.platform}-${process.arch}; install gleam ${VERSION} yourself`,
	);
	process.exit(1);
}

const url = `https://github.com/gleam-lang/gleam/releases/download/v${VERSION}/gleam-v${VERSION}-${target}.tar.gz`;
console.log(`downloading ${url}`);
const response = await fetch(url);
if (!response.ok) {
	console.error(`download failed: HTTP ${response.status}`);
	process.exit(1);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gleam-'));
const archive = path.join(tmp, 'gleam.tar.gz');
fs.writeFileSync(archive, Buffer.from(await response.arrayBuffer()));
execFileSync('tar', ['-xzf', archive, '-C', tmp]);
fs.mkdirSync(binDir, {recursive: true});
fs.copyFileSync(path.join(tmp, 'gleam'), installed);
fs.chmodSync(installed, 0o755);
fs.rmSync(tmp, {recursive: true, force: true});
console.log(`installed ${version(installed)} to ${installed}`);
