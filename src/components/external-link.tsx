import type {ComponentProps} from 'react';

export function ExternalLink(
	props: Omit<ComponentProps<'a'>, 'target' | 'rel'> & {href: `https://${string}`},
) {
	return <a {...props} target="_blank" rel="noopener noreferrer" />;
}
