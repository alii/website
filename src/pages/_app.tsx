import React, {ReactNode, StrictMode, useEffect, useRef, useState} from 'react';
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

import 'react-tippy/dist/tippy.css';
import 'tailwindcss/tailwind.css';
import '../styles/global.css';
import 'nprogress/nprogress.css';
import {AnimatePresence, motion} from 'framer-motion';
import {fetcher} from '../util/fetcher';

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

export default function App({Component, pageProps, router}: AppProps) {
	const [mobileMenuOpen, setMenuOpen] = useState(false);
	const [hasScrolled, setHasScrolled] = useState(false);

	const ballCanvas = useRef<HTMLDivElement>(null);

	const toggleMenu = () => {
		setMenuOpen(old => !old);
	};

	useEffect(() => {
		if (mobileMenuOpen) {
			document.body.style.overflow = 'hidden';
			return;
		}

		document.body.style.overflow = 'unset';
	}, [mobileMenuOpen]);

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

		setMenuOpen(false);

		void new Audio('/pop.mp3').play().catch(() => null);
	}, [router.pathname]);

	useEffect(() => {
		if (typeof window === 'undefined') {
			return;
		}

		const listener = () => {
			setHasScrolled(window.scrollY > 20);
		};

		document.addEventListener('scroll', listener);

		return () => {
			document.removeEventListener('scroll', listener);
		};
	}, []);

	const closeMenu = () => {
		setMenuOpen(false);
	};

	const navLinks = (
		<>
			<NavLink href="/" closeMenu={closeMenu}>
				/
			</NavLink>
			<NavLink href="/about" closeMenu={closeMenu}>
				/about
			</NavLink>
			<NavLink href="/talk" closeMenu={closeMenu}>
				/talk
			</NavLink>
		</>
	);

	return (
		<StrictMode>
			<SWRConfig
				value={{
					fallback: {
						// SSR Lanyard's data
						[`lanyard:${DISCORD_ID}`]: pageProps?.lanyard as unknown,
						'https://gh-pinned-repos.egoist.sh/?username=alii':
							pageProps?.pinnedRepos as unknown,
					},
					fetcher,
				}}
			>
				<Toaster toastOptions={{position: 'top-left'}} />

				<Head>
					<title>Alistair Smith</title>
				</Head>

				<AnimatePresence>
					{mobileMenuOpen && (
						<motion.div
							initial={{opacity: 0, y: -10}}
							animate={{opacity: 1, y: 0}}
							exit={{opacity: 0}}
							className="sm:hidden fixed inset-0 z-10 py-24 px-8 space-y-2 bg-gray-900"
						>
							<h1 className="text-4xl font-bold">Menu.</h1>

							<ul className="grid grid-cols-1 gap-2">{navLinks}</ul>
						</motion.div>
					)}
				</AnimatePresence>

				<div className="sm:hidden overflow-hidden sticky top-0 z-20 h-32 transition-all">
					<div
						className={`${
							hasScrolled || mobileMenuOpen ? 'mt-0' : 'mt-10 mx-5'
						} bg-gray-900 relative transition-all ${
							hasScrolled || mobileMenuOpen ? 'rounded-none' : 'rounded-lg'
						}`}
					>
						<div
							className={`pr-5 flex justify-between transition-colors space-x-2 ${
								mobileMenuOpen ? 'bg-gray-800' : 'bg-transparent'
							}`}
						>
							<button
								type="button"
								className="block relative z-50 px-2 text-gray-500 focus:ring transition-all"
								onClick={toggleMenu}
							>
								<Hamburger
									toggled={mobileMenuOpen}
									size={20}
									color="currentColor"
								/>
							</button>

							<div className="overflow-hidden py-2 px-1">
								<Song />
							</div>
						</div>
					</div>
				</div>

				<div className="py-10 px-5 mx-auto max-w-4xl">
					<div className="hidden sm:flex items-center space-x-2">
						<nav className="flex-1">
							<ul className="flex space-x-4">{navLinks}</ul>
						</nav>

						<div className="overflow-hidden py-2 px-1">
							<Song />
						</div>
					</div>

					<div className="md:py-24 mx-auto space-y-12 max-w-3xl">
						<Component {...pageProps} />
					</div>

					<div className="p-4 py-10 mx-auto mt-20 max-w-3xl border-t-2 border-white border-opacity-10 opacity-50">
						<h1 className="text-3xl font-bold">Alistair Smith</h1>
						<p>Software Engineer • {new Date().getFullYear()}</p>
					</div>
				</div>

				<div
					ref={ballCanvas}
					className="fixed z-30 w-6 h-6 bg-transparent rounded-full border border-white shadow-md opacity-0 duration-200 pointer-events-none ball-transitions"
				/>
			</SWRConfig>
		</StrictMode>
	);
}

function NavLink(props: {
	children: ReactNode;
	href: string;
	closeMenu?: () => void;
}) {
	return (
		<li>
			<Link href={props.href}>
				<a
					className="block sm:inline-block py-3 sm:px-5 font-mono text-lg sm:text-sm sm:font-normal hover:text-white no-underline sm:underline sm:bg-white sm:bg-opacity-0 sm:hover:bg-opacity-10 rounded-md sm:rounded-full"
					onClick={props.closeMenu}
				>
					{props.children}
				</a>
			</Link>
		</li>
	);
}
