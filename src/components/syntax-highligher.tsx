import type {PropsWithChildren} from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';

import light from 'react-syntax-highlighter/dist/cjs/styles/hljs/lightfair';
import dark from 'react-syntax-highlighter/dist/cjs/styles/hljs/vs2015';

import clsx from 'clsx';
import {TbBrandCss3, TbBrandHtml5, TbBrandJavascript, TbBrandTypescript} from 'react-icons/tb';

const Pre = ({children}: PropsWithChildren) => <pre className="px-4">{children}</pre>;

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
						key={line}
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
		<p className="mx-1 mt-1 mb-0 rounded bg-zinc-100 px-3 py-1.5 text-sm text-zinc-600 dark:bg-zinc-900/50 dark:text-zinc-400">
			<span className="mr-2">{icon}</span>
			<span>{filename}</span>
		</p>
	);
}

export function Highlighter({
	children,
	language = 'typescript',
	filename,
}: {
	readonly children: string;
	readonly language?: 'typescript' | 'javascript' | 'bash' | 'json' | 'css' | 'html' | 'markdown';
	readonly filename?: string;
}) {
	return (
		<div className="[&_pre]:!m-0 [&_pre]:border-none">
			<div className="hidden overflow-hidden rounded-md border border-zinc-800 dark:block">
				{filename && <Filename filename={filename} />}

				<SyntaxHighlighter language={language} style={dark} PreTag={Pre}>
					{children}
				</SyntaxHighlighter>
			</div>

			<div className="rounded-md border border-zinc-200 dark:hidden">
				{filename && <Filename filename={filename} />}

				<SyntaxHighlighter language={language} style={light} PreTag={Pre}>
					{children}
				</SyntaxHighlighter>
			</div>
		</div>
	);
}
