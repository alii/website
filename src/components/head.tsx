import type {ReactNode} from 'react';

/**
 * React 19 moves `<title>`, `<meta>` and `<link>` into the document's `<head>` from anywhere in the
 * tree, so this only groups them.
 */
export function Head({children}: {children: ReactNode}) {
	return <>{children}</>;
}
