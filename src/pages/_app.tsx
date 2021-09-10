import React, {ReactNode, StrictMode, useEffect, useRef} from 'react';
import {AppProps} from 'next/app';
import Head from 'next/head';
import {Router} from 'next/router';
import NProgress from 'nprogress';
import Link from 'next/link';
import 'react-tippy/dist/tippy.css';
import 'tailwindcss/tailwind.css';
import '../styles/global.css';
import 'nprogress/nprogress.css';
import {loadCursor} from '../util/cursor';
import {SWRConfig} from 'swr';
import {Song} from '../components/song';
import {Toaster} from 'react-hot-toast';

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

export default function App({Component, pageProps, router}: AppProps) {
	const ballCanvas = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (typeof window === 'undefined' || !ballCanvas.current) {
			return;
		}

		return loadCursor(ballCanvas.current);
	}, []);

	useEffect(() => {
		if (typeof window === 'undefined') {
			return;
		}

		void new Audio('/pop.mp3').play().catch(() => null);
	}, [router.pathname]);

	return (
		<StrictMode>
			<SWRConfig
				value={{
					async fetcher<T>(url: string): Promise<T> {
						const request = await fetch(url);
						const json = (await request.json()) as unknown;

						if (request.status >= 400) {
							let message: string;

							if (json && typeof json === 'object' && 'message' in json) {
								// Safe to assert because of the ??= underneath this
								message = (json as {message?: string}).message!;
							}

							message ??= 'Something went wrong';

							throw new Error(message);
						}

						return json as T;
					},
				}}
			>
				<Toaster toastOptions={{position: 'top-left'}} />

				<Head>
					<title>Alistair Smith</title>
				</Head>

				<div className="py-10 max-w-4xl px-5 mx-auto">
					<div className="flex items-center">
						<nav className="flex-1">
							<ul className="space-x-4 flex">
								<NavLink href="/">/</NavLink>
								<NavLink href="/about">/about</NavLink>
								<NavLink href="/misc">/misc</NavLink>
							</ul>
						</nav>
						<div className="hidden sm:block">
							<Song />
						</div>
					</div>
					<Component {...pageProps} />
				</div>

				<div
					ref={ballCanvas}
					className="opacity-0 fixed ball-transitions duration-200 pointer-events-none z-30 h-3 w-3 bg-white rounded-full shadow-md"
				/>
			</SWRConfig>
		</StrictMode>
	);
}

function NavLink(props: {children: ReactNode; href: string}) {
	return (
		<li>
			<Link href={props.href}>
				<a className="font-mono inline-block px-5 py-3 hover:text-white bg-white bg-opacity-0 hover:bg-opacity-10 rounded-full">
					{props.children}
				</a>
			</Link>
		</li>
	);
}
