// Was src/pages/_app.tsx and src/pages/_document.tsx. React 19 hoists the <title>, <meta>, <link>
// and async <script> elements into <head>.
import '../../src/globals.css';

import type {ReactNode} from 'react';
import {Toaster} from 'react-hot-toast';
// The bundled URLs of the fonts of globals.css, which imports the same files.
import iosevka from '../../public/fonts/iosevka-latin-400.woff2';
import karla from '../../public/fonts/karla-latin.woff2';
import lora from '../../public/fonts/lora-latin.woff2';

const tag = process.env.NEXT_PUBLIC_GTM_ID;

export default function RootLayout({children}: {children: ReactNode}) {
	return (
		<>
			<title>Alistair Smith</title>
			<meta content="width=device-width, initial-scale=1" name="viewport" />
			<link rel="icon" href="/favicon.ico" />
			<link rel="alternate" type="application/rss+xml" title="Alistair Smith" href="/feed.xml" />
			<link
				rel="preload"
				href={karla}
				as="font"
				type="font/woff2"
				crossOrigin="anonymous"
			/>
			<link
				rel="preload"
				href={lora}
				as="font"
				type="font/woff2"
				crossOrigin="anonymous"
			/>
			<link
				rel="preload"
				href={iosevka}
				as="font"
				type="font/woff2"
				crossOrigin="anonymous"
			/>
			<script async src="https://lab.alistair.cloud/latest.js" />
			{tag && <script async src={`https://www.googletagmanager.com/gtag/js?id=${tag}`} />}

			{children}

			<Toaster />

			<script defer src="https://assets.onedollarstats.com/stonks.js" />
			<script
				dangerouslySetInnerHTML={{
					__html: `if("paintWorklet" in CSS)CSS.paintWorklet.addModule("https://www.unpkg.com/css-houdini-squircle@0.3.0/squircle.min.js")`,
				}}
			/>
			{tag && (
				<script
					dangerouslySetInnerHTML={{
						__html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag("js",new Date());gtag("config",${JSON.stringify(tag)})`,
					}}
				/>
			)}
		</>
	);
}
