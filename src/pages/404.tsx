import Link from 'next/link';
import {Layout} from '../components/layout';
import {pageTitle} from '../ui';

export default function Page404() {
	return (
		<Layout>
			<h1 className={`mb-4 ${pageTitle}`}>404</h1>

			<p className="mb-4 text-stone-500 dark:text-stone-400">
				Sorry, I could not find that page. It may have moved or never existed.
			</p>

			<p>
				<Link href="/">Go back home &rarr;</Link>
			</p>
		</Layout>
	);
}
