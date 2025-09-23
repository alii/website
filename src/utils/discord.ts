export function codeblock(code: string, lang = 'ts') {
	return `\`\`\`${lang}
${code}
\`\`\``;
}
