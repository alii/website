import clsx from 'clsx';
import type {PropsWithChildren} from 'react';
import {RiJavascriptFill} from 'react-icons/ri';
import {SiGleam} from 'react-icons/si';
import {TbBrandCss3, TbBrandHtml5, TbBrandTypescript} from 'react-icons/tb';

// Fine-grained, synchronous Shiki. We preload only the languages/themes we use
// and use the pure-JS regex engine (no oniguruma WASM), so codeToHtml is sync
// and works at build time / in serverless with no async and no native deps.
import type {HighlighterCore} from 'shiki';
import {createHighlighterCoreSync} from 'shiki/core';
import {createJavaScriptRegexEngine} from 'shiki/engine/javascript';
import bash from 'shiki/langs/bash.mjs';
import css from 'shiki/langs/css.mjs';
import gleam from 'shiki/langs/gleam.mjs';
import html from 'shiki/langs/html.mjs';
import javascript from 'shiki/langs/javascript.mjs';
import json from 'shiki/langs/json.mjs';
import markdown from 'shiki/langs/markdown.mjs';
import rust from 'shiki/langs/rust.mjs';
import typescript from 'shiki/langs/typescript.mjs';
import {paperDark, paperLight} from './shiki-themes';

const highlighter = ((
	globalThis as typeof globalThis & {__shikiHighlighter?: HighlighterCore}
).__shikiHighlighter ??= createHighlighterCoreSync({
	engine: createJavaScriptRegexEngine({forgiving: true}),
	themes: [paperLight, paperDark],
	langs: [typescript, javascript, bash, json, css, html, markdown, gleam, rust],
}));

type Language =
	'typescript' | 'javascript' | 'bash' | 'json' | 'css' | 'html' | 'markdown' | 'gleam' | 'rust';

export function Shell({
	children,
	hasDollarOnFirstLineOnly,
}: {
	readonly children: string;
	readonly hasDollarOnFirstLineOnly?: boolean;
}) {
	const lines = children.split('\n');

	return (
		<pre className="px-4">
			{lines.map((line, index) => {
				const isFirst = index === 0;

				return (
					<p
						key={index}
						className={clsx(
							'my-0! before:select-none',
							hasDollarOnFirstLineOnly
								? isFirst &&
										'text-yellow-800 before:text-yellow-600 before:content-["$_"] dark:text-yellow-200 dark:before:text-yellow-400'
								: 'before:content-["$_"]',
						)}
					>
						{line === '' ? <br /> : line}
					</p>
				);
			})}
		</pre>
	);
}

function Filename({filename}: {readonly filename: string}) {
	const icon = (() => {
		switch (true) {
			case filename.endsWith('.ts'):
				return <TbBrandTypescript className="inline" />;
			case filename.endsWith('.js'):
			case filename.endsWith('.mjs'):
				return <RiJavascriptFill className="inline" />;
			case filename.endsWith('.html'):
				return <TbBrandHtml5 className="inline" />;
			case filename.endsWith('.css'):
				return <TbBrandCss3 className="inline" />;
			case filename.endsWith('.gleam'):
				return <SiGleam className="inline" />;
			default:
				return null;
		}
	})();

	return (
		<p className="m-0 border-b border-stone-200 bg-stone-100 px-3 py-1.5 font-mono text-xs text-stone-500 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
			{icon && <span className="mr-2">{icon}</span>}
			<span>{filename}</span>
		</p>
	);
}

export function Highlighter({
	children,
	language = 'typescript',
	filename,
}: PropsWithChildren<{
	readonly children: string;
	readonly language?: Language;
	readonly filename?: string;
}>) {
	const html = highlighter.codeToHtml(children.replace(/\n$/, ''), {
		lang: language,
		themes: {light: 'paper-light', dark: 'paper-dark'},
	});

	return (
		<div className="not-prose my-5 overflow-hidden rounded-lg border border-stone-200 text-[12.5px] dark:border-stone-800">
			{filename && <Filename filename={filename} />}
			<div dangerouslySetInnerHTML={{__html: html}} />
		</div>
	);
}
