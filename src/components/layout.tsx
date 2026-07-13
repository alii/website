import clsx from 'clsx';
import Link from 'next/link';
import type {ReactNode} from 'react';
import {wrap} from '../ui';

const footerLinks = [
	{href: '/', label: 'home'},
	{href: 'https://github.com/alii', label: 'github'},
	{href: 'https://x.com/intent/user?screen_name=alistaiir', label: 'twitter'},
];

export function Layout({children}: {children: ReactNode}) {
	return (
		<div className={clsx(wrap, 'flex min-h-screen flex-col py-20 max-sm:py-10')}>
			<main className="flex-1">{children}</main>

			<footer className="mt-24 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-stone-400 dark:text-stone-500">
				<span>&copy; {new Date().getFullYear()} Alistair Smith</span>
				{footerLinks.map(link => {
					const className = 'text-stone-400 no-underline hover:underline dark:text-stone-500';

					// next/link is for page navigations only; mailto/external links
					// need a plain anchor so the browser handles them natively
					if (!link.href.startsWith('/')) {
						return (
							<a key={link.href} href={link.href} className={className}>
								{link.label}
							</a>
						);
					}

					return (
						<Link key={link.href} href={link.href} className={className}>
							{link.label}
						</Link>
					);
				})}
			</footer>
		</div>
	);
}
