import {paperDark, paperLight} from '@/components/shiki-themes';
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

// Synchronous shiki with the pure-JS regex engine: no WASM, works at build
// time and in serverless. One instance per process, shared with the TSX
// Highlighter through the same global until that moves too.
const highlighter = ((
	globalThis as typeof globalThis & {__shikiHighlighter?: HighlighterCore}
).__shikiHighlighter ??= createHighlighterCoreSync({
	engine: createJavaScriptRegexEngine({forgiving: true}),
	themes: [paperLight, paperDark],
	langs: [typescript, javascript, bash, json, css, html, markdown, gleam, rust],
}));

type Language =
	'typescript' | 'javascript' | 'bash' | 'json' | 'css' | 'html' | 'markdown' | 'gleam' | 'rust';

export const highlight = (source: string, language: Language) =>
	highlighter.codeToHtml(source, {
		lang: language,
		themes: {light: 'paper-light', dark: 'paper-dark'},
	});
