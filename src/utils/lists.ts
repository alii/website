export const SUPPORTS_INTL = typeof Intl !== 'undefined';

export function formatList(list: string[], type: Intl.ListFormatType): string {
	if (SUPPORTS_INTL) {
		return new Intl.ListFormat('en-US', {type}).format(list);
	}

	return list.join(', ');
}
