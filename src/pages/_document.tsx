import Document, {Head, Html, Main, NextScript} from 'next/document';

export default class WebsiteDocument extends Document {
	override render() {
		return (
			<Html>
				<Head>
					<link
						rel="alternate"
						type="application/rss+xml"
						title="Alistair Smith"
						href="/feed.xml"
					/>
					<link
						rel="preload"
						href="/fonts/karla-latin.woff2"
						as="font"
						type="font/woff2"
						crossOrigin="anonymous"
					/>
					<link
						rel="preload"
						href="/fonts/lora-latin.woff2"
						as="font"
						type="font/woff2"
						crossOrigin="anonymous"
					/>
					<link
						rel="preload"
						href="/fonts/iosevka-latin-400.woff2"
						as="font"
						type="font/woff2"
						crossOrigin="anonymous"
					/>
				</Head>
				<body>
					<Main />
					<NextScript />
					<script async defer src="https://lab.alistair.cloud/latest.js" />
					<script defer src="https://assets.onedollarstats.com/stonks.js" />
					<script
						dangerouslySetInnerHTML={{
							__html: `if("paintWorklet" in CSS)CSS.paintWorklet.addModule("https://www.unpkg.com/css-houdini-squircle@0.3.0/squircle.min.js")`,
						}}
					/>
				</body>
			</Html>
		);
	}
}
