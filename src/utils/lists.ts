import {bwitch} from 'bwitch';

export const SUPPORTS_INTL = typeof Intl !== 'undefined';

export function formatList(list: string[], type: Intl.ListFormatType): string {
	return bwitch(SUPPORTS_INTL)
		.case(true, () => new Intl.ListFormat('en-US', {type}).format(list))
		.or(() => list.join(', '));
}
