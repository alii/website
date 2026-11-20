import type {ComponentProps} from 'react';

/** A plain link: Bake has no client-side router, so every navigation loads the page. */
export function Link(props: ComponentProps<'a'>) {
	return <a {...props} />;
}
