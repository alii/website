import React, {StrictMode, useEffect, useRef, useState} from 'react';
import {AppProps} from 'next/app';
import Head from 'next/head';
import Image from 'next/image';
import {Router} from 'next/router';
import {AnimatePresence, motion} from 'framer-motion';
import NProgress from 'nprogress';
import {useLastFM} from 'use-last-fm';
import {animations} from '../core/animations';
import {Consts} from '../core/consts';
import {initialBackground} from '../core/data';

import 'react-tippy/dist/tippy.css';
import 'tailwindcss/tailwind.css';
import '../styles/global.css';
import 'nprogress/nprogress.css';

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

export default function App({Component, pageProps, router}: AppProps) {
	const lastFm = useLastFM(Consts.LastFMUsername, Consts.LastFMToken);
	const [url, setURL] = useState(initialBackground);
	const ballCanvas = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (typeof window === 'undefined' || !ballCanvas.current) {
			return;
		}

		return loadBall(ballCanvas.current);
	});

	useEffect(() => {
		if (lastFm.status === 'playing') {
			setURL(lastFm.song.art);
		}
	}, [lastFm.song?.art, lastFm.status]);

	useEffect(() => {
		if (typeof window === 'undefined') {
			return;
		}

		void new Audio('/pop.mp3').play().catch(() => null);
	}, [router.pathname]);

	return (
		<StrictMode>
			<Head>
				<title>Alistair Smith</title>
			</Head>
			<Image className="bg" src={url} alt="" layout="fill" objectFit="cover" />
			<div className="absolute left-0 right-0 top-0 bottom-0">
				<AnimatePresence>
					<motion.div key={router.pathname} {...animations} className="absolute h-full w-full">
						<Component {...pageProps} />
					</motion.div>
				</AnimatePresence>
			</div>
			<div
				ref={ballCanvas}
				className="fixed ball-transitions duration-200 pointer-events-none z-30 h-3 w-3 bg-white rounded-full shadow-md"
			/>
		</StrictMode>
	);
}

function loadBall(ball: HTMLDivElement) {
	let x = window.innerWidth / 2;
	let y = window.innerHeight / 2;

	let ballX = x;
	let ballY = y;

	let hideTimeout: NodeJS.Timeout | null = null;

	function drawBall() {
		ballX += (x - ballX) * 0.1 - 0.5;
		ballY += (y - ballY) * 0.1 - 0.5;

		ball.style.top = `${ballY - window.scrollY}px`;
		ball.style.left = `${ballX}px`;
	}

	function loop() {
		drawBall();
		requestAnimationFrame(loop);
	}

	loop();

	function touch(e: TouchEvent) {
		x = e.touches[0].pageX;
		y = e.touches[0].pageY;
	}

	function mousemove(e: MouseEvent) {
		ball.style.opacity = '1';

		if (hideTimeout) {
			clearTimeout(hideTimeout);
		}

		x = e.pageX;
		y = e.pageY;

		hideTimeout = setTimeout(() => {
			ball.style.opacity = '0';
		}, 2500);
	}

	function mousedown() {
		ball.style.transform = 'scale(2)';
	}

	function mouseup() {
		ball.style.transform = 'scale(1)';
	}

	window.addEventListener('touchstart', touch);
	window.addEventListener('touchmove', touch);
	window.addEventListener('mousemove', mousemove);
	window.addEventListener('mousedown', mousedown);
	window.addEventListener('mouseup', mouseup);

	return () => {
		window.removeEventListener('touchstart', touch);
		window.removeEventListener('touchmove', touch);
		window.removeEventListener('mousemove', mousemove);
		window.removeEventListener('mousedown', mousedown);
		window.removeEventListener('mouseup', mouseup);
	};
}
