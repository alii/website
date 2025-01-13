import {CSideScript} from '@c-side/next';
import Document, {Head, Html, Main, NextScript} from 'next/document';

export default class WebsiteDocument extends Document {
	override render() {
		return (
			<Html>
				<Head>
					<CSideScript />
				</Head>
				<body>
					<Main />
					<NextScript />

					<script async defer src="https://sdk.scdn.co/spotify-player.js" />
					<script async defer src="https://lab.alistair.cloud/latest.js" />
				</body>
			</Html>
		);
	}
}
