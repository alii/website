import clsx from 'clsx';
import './globals.css';

import {JetBrains_Mono, Inter} from '@next/font/google';

const title = JetBrains_Mono({
	subsets: ['latin'],
	variable: '--font-title',
});

const inter = Inter({
	subsets: ['latin'],
	variable: '--font-inter',
});

export default function RootLayout({children}: {children: React.ReactNode}) {
	return (
		<html lang="en" className={clsx(inter.variable, title.variable)}>
			<head />

			<body>{children}</body>
		</html>
	);
}
