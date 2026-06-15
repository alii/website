import clsx from 'clsx';
import Link from 'next/link';
import {useRouter} from 'next/router';
import type {ReactNode} from 'react';
import {wrap} from '../ui';
import {ButtonWall} from './banner-88x31';

const tabs = [
	{href: '/', label: 'home'},
	{href: '/blog', label: 'blog'},
	{href: '/experiments', label: 'experiments'},
	{href: '/stats', label: 'stats'},
];

function isActive(pathname: string, href: string) {
	if (href === '/') {
		return pathname === '/';
	}

	if (href === '/blog') {
		return pathname === '/blog' || pathname === '/[slug]';
	}

	return pathname === href || pathname.startsWith(href + '/');
}

const tabBase =
	'block border-r border-zinc-300 px-3.5 py-[7px] text-zinc-900 hover:bg-zinc-200 hover:no-underline dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800';
const tabActive =
	'bg-zinc-200 font-bold text-zinc-900 shadow-[inset_0_-3px_0_#f48024] dark:bg-zinc-950 dark:text-white';

export function Layout({children, sidebar}: {children: ReactNode; sidebar?: ReactNode}) {
	const {pathname} = useRouter();

	return (
		<div className="flex min-h-screen flex-col">
			<header className="border-t-[3px] border-t-[#f48024] border-b border-b-zinc-300 bg-white dark:border-b-zinc-700 dark:bg-zinc-900">
				<div className={clsx(wrap, 'flex h-[46px] items-center gap-2.5')}>
					<Link
						href="/"
						className="inline-flex items-center gap-2 !text-zinc-900 hover:no-underline dark:!text-zinc-100"
					>
						<span className="grid size-6 place-items-center rounded-[3px] bg-[#f48024] text-[15px] font-bold text-white shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)]">
							A
						</span>
						<span className="text-base font-bold tracking-tight">alistair.sh</span>
					</Link>
					<span className="text-[11px] italic text-zinc-500 dark:text-zinc-400">
						a personal homepage &amp; weblog
					</span>
					<span className="ml-auto text-[11px] text-zinc-500 dark:text-zinc-400">
						<Link href="https://github.com/alii">alii</Link> | <Link href="/stats">stats</Link>
					</span>
				</div>

				<nav className="border-b border-zinc-300 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
					<div className={wrap}>
						<ul className="flex items-stretch text-xs">
							{tabs.map(tab => (
								<li key={tab.href}>
									<Link
										href={tab.href}
										className={clsx(tabBase, isActive(pathname, tab.href) && tabActive)}
									>
										{tab.label}
									</Link>
								</li>
							))}
							<li className="ml-auto">
								<Link
									href="https://x.com/intent/user?screen_name=alistaiir"
									className="block border-l border-zinc-300 px-3.5 py-[7px] text-zinc-500 hover:no-underline dark:border-zinc-700 dark:text-zinc-400"
								>
									twitter
								</Link>
							</li>
						</ul>
					</div>
				</nav>
			</header>

			<div className={clsx(wrap, 'flex flex-1 items-start gap-4 py-4 max-[760px]:flex-col')}>
				<main className="min-w-0 flex-1">{children}</main>
				{sidebar && <aside className="w-[300px] shrink-0 max-[760px]:w-full">{sidebar}</aside>}
			</div>

			<footer className="shrink-0 border-t border-zinc-300 bg-white text-[11px] text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
				<div className={clsx(wrap, 'py-4')}>
					<div className="mb-3.5 border-b border-zinc-300 pb-3.5 dark:border-zinc-700">
						<ButtonWall />
					</div>

					<div className="flex flex-wrap items-center gap-3.5 [&_a]:text-zinc-500 dark:[&_a]:text-zinc-400">
						<span>&copy; {new Date().getFullYear()} Alistair Smith</span>
						<Link href="https://github.com/alii">github/alii</Link>
						<Link href="https://x.com/intent/user?screen_name=alistaiir">twitter/alistaiir</Link>
						<Link href="https://www.anthropic.com/">anthropic</Link>
						<Link href="https://github.com/alii/website">source</Link>
					</div>
				</div>
			</footer>
		</div>
	);
}
