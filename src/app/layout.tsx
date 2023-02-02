import './globals.css';

import clsx from 'clsx';
import {Space_Mono, Inter_Tight} from '@next/font/google';
import {AppToaster} from '../components/toaster';

const title = Space_Mono({
	subsets: ['latin'],
	variable: '--font-title',
	weight: ['400', '700'],
});

const inter = Inter_Tight({
	subsets: ['latin'],
	variable: '--font-inter',
});

export default function RootLayout({children}: {children: React.ReactNode}) {
	return (
		<html lang="en" className={clsx(inter.variable, title.variable)}>
			<head />
			<body>
				{children}

				<AppToaster />
				<script async defer src="https://lab.alistair.cloud/latest.js" />
			</body>
		</html>
	);
}
