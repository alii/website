import React, {
	ReactNode,
	StrictMode,
	useEffect,
	useReducer,
	useRef,
	useState,
} from 'react';
import {AppProps} from 'next/app';
import Head from 'next/head';
import {Router} from 'next/router';
import NProgress from 'nprogress';
import Link from 'next/link';
import {SWRConfig} from 'swr';
import {Toaster} from 'react-hot-toast';
import {Squash as Hamburger} from 'hamburger-react';
import {loadCursor} from '../util/cursor';
import {DISCORD_ID, Song} from '../components/song';
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
import {AnimatePresence, motion} from 'framer-motion';

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

function LocalContextHooks() {
	useDetectLanguageChange();
	return null;
}

export default function App({Component, pageProps, router}: AppProps) {
	const [mobileMenuOpen, toggleMenu] = useReducer(old => !old, false);
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

	const [hasScrolled, setHasScrolled] = useState(false);

	useEffect(() => {
		if (typeof window === 'undefined') {
			return;
		}

		const listener = () => {
			setHasScrolled(window.scrollY >= 50);
		};

		document.addEventListener('scroll', listener);

		return () => {
			document.removeEventListener('scroll', listener);
		};
	}, []);

	const navLinks = (
		<>
			<NavLink href="/">/</NavLink>
			<NavLink href="/about">/about</NavLink>
			<NavLink href="/talk">/talk</NavLink>
		</>
	);

	const languageSwitcher = (
		<Select<typeof lang>
			items={languages.map(lang => ({name: lang, value: lang}))}
			selected={{value: lang, name: lang}}
			setSelected={v => {
				setLang(v.value);
			}}
		/>
	);

	return (
		<StrictMode>
			<translator.TranslationProvider activeLang={lang}>
				<SWRConfig
					value={{
						fallback: {
							// SSR Lanyard's data
							[`lanyard:${DISCORD_ID}`]: pageProps?.lanyard as unknown,
							'https://gh-pinned-repos.egoist.sh/?username=alii':
								pageProps?.pinnedRepos as unknown,
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

					<AnimatePresence>
						{mobileMenuOpen && (
							<motion.div
								initial={{opacity: 0, y: -10}}
								animate={{opacity: 1, y: 0}}
								exit={{opacity: 0}}
								className="inset-0 bg-gray-900 sm:hidden fixed z-10 px-8 py-24"
							>
								<h1 className="text-4xl font-bold">Menu.</h1>
							</motion.div>
						)}
					</AnimatePresence>

					<div
						className={`${
							hasScrolled || mobileMenuOpen ? 'rounded-none' : 'mx-5 rounded-lg'
						} sm:hidden sticky ${
							mobileMenuOpen ? 'mt-0' : 'mt-10'
						} top-0 z-20 bg-gray-900 transition-all overflow-hidden`}
					>
						<div className="pr-5 flex justify-between">
							<button
								type="button"
								className={`px-2 z-50 text-gray-500 relative block transition-all rounded-br-md ${
									mobileMenuOpen ? 'bg-gray-800' : ''
								}`}
								onClick={toggleMenu}
							>
								<Hamburger
									toggled={mobileMenuOpen}
									size={20}
									color="currentColor"
								/>
							</button>

							<div className="max-w-full truncate">
								<Song />
							</div>
						</div>
					</div>

					<div className="py-10 max-w-4xl px-5 mx-auto">
						<div className="hidden sm:flex items-center">
							<nav className="flex-1">
								<ul className="space-x-4 flex">
									{navLinks}
									<li>{languageSwitcher}</li>
								</ul>
							</nav>

							<div>
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
