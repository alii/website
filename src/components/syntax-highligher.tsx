import clsx from 'clsx';
import type {PropsWithChildren} from 'react';
import {TbBrandCss3, TbBrandHtml5, TbBrandJavascript, TbBrandTypescript} from 'react-icons/tb';

// Fine-grained, synchronous Shiki. We preload only the languages/themes we use
// and use the pure-JS regex engine (no oniguruma WASM), so codeToHtml is sync
// and works at build time / in serverless with no async and no native deps.
import {createHighlighterCoreSync} from 'shiki/core';
import {createJavaScriptRegexEngine} from 'shiki/engine/javascript';
import bash from 'shiki/langs/bash.mjs';
import css from 'shiki/langs/css.mjs';
import html from 'shiki/langs/html.mjs';
import javascript from 'shiki/langs/javascript.mjs';
import json from 'shiki/langs/json.mjs';
import markdown from 'shiki/langs/markdown.mjs';
import typescript from 'shiki/langs/typescript.mjs';
import {lightfair, vs2015} from './shiki-themes';

const highlighter = createHighlighterCoreSync({
	engine: createJavaScriptRegexEngine({forgiving: true}),
	themes: [lightfair, vs2015],
	langs: [typescript, javascript, bash, json, css, html, markdown],
});

type Language = 'typescript' | 'javascript' | 'bash' | 'json' | 'css' | 'html' | 'markdown';

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
							'!my-0 before:select-none',
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
				return <TbBrandJavascript className="inline" />;
			case filename.endsWith('.html'):
				return <TbBrandHtml5 className="inline" />;
			case filename.endsWith('.css'):
				return <TbBrandCss3 className="inline" />;
			default:
				return null;
		}
	})();

	return (
		<p className="m-0 border-b border-zinc-300 bg-zinc-100 px-3 py-1.5 font-mono text-xs text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
			<span className="mr-2">{icon}</span>
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
		themes: {light: 'lightfair', dark: 'vs2015'},
	});

	return (
		<div className="not-prose overflow-hidden border border-zinc-300 text-[12.5px] dark:border-zinc-700">
			{filename && <Filename filename={filename} />}
			<div dangerouslySetInnerHTML={{__html: html}} />
		</div>
	);
}
