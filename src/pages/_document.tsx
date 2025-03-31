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
					<script async defer src="https://lab.alistair.cloud/latest.js" />
					<script defer src="https://assets.onedollarstats.com/stonks.js" />
				</body>
			</Html>
		);
	}
}
