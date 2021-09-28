import React, {ReactNode, StrictMode, useEffect, useRef, useState} from 'react';
import {AppProps} from 'next/app';
import Head from 'next/head';
import {Router} from 'next/router';
import NProgress from 'nprogress';
import Link from 'next/link';
import {loadCursor} from '../util/cursor';
import {SWRConfig} from 'swr';
import {DISCORD_ID, Song} from '../components/song';
import {Toaster} from 'react-hot-toast';
import {
	getInitialLanguage,
	languages,
	T,
	translator,
	useDetectLanguageChange,
} from '../i18n/translator';
import {Select} from '../components/select';

import 'react-tippy/dist/tippy.css';
import 'tailwindcss/tailwind.css';
import '../styles/global.css';
import 'nprogress/nprogress.css';

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

function LocalContextHooks() {
	useDetectLanguageChange();
	return null;
}

export default function App({Component, pageProps, router}: AppProps) {
	const ballCanvas = useRef<HTMLDivElement>(null);
	const [lang, setLang] = useState(getInitialLanguage);

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
			<translator.TranslationProvider activeLang={lang}>
				<SWRConfig
					value={{
						fallback: {
							// SSR Lanyard's data
							[`lanyard:${DISCORD_ID}`]: pageProps?.lanyard,
						},
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

					<LocalContextHooks />

					<div className="py-10 max-w-4xl px-5 mx-auto">
						<div className="flex items-center">
							<nav className="flex-1">
								<ul className="space-x-4 flex">
									<NavLink href="/">/</NavLink>
									<NavLink href="/about">/about</NavLink>
									<NavLink href="/talk">/talk</NavLink>
									<li>
										<Select<typeof lang>
											items={languages.map(lang => {
												return {
													name: lang,
													value: lang,
												};
											})}
											selected={{value: lang, name: lang}}
											setSelected={v => setLang(v.value)}
										/>
									</li>
								</ul>
							</nav>
							<div className="hidden sm:block">
								<Song />
							</div>
						</div>
						<div className="max-w-3xl mx-auto py-24 space-y-12">
							<Component {...pageProps} />
						</div>

						<div className="max-w-3xl opacity-50 mx-auto p-4 py-10 mt-20 border-t-2 border-white border-opacity-10">
							<h1 className="text-3xl font-bold">Alistair Smith</h1>
							<p>
								<T phrase="Software Engineer" /> • {new Date().getFullYear()}
							</p>
						</div>
					</div>

					<div
						ref={ballCanvas}
						className="opacity-0 fixed ball-transitions duration-200 pointer-events-none z-30 h-6 w-6 bg-transparent border border-white rounded-full shadow-md"
					/>
				</SWRConfig>
			</translator.TranslationProvider>
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
