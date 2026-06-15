import Link from 'next/link';
import {Layout} from '../components/layout';
import {box, boxBd, boxHd} from '../ui';

export default function Page404() {
	return (
		<Layout>
			<section className={box}>
				<div className={boxHd}>
					<span className="text-[#f48024]">404</span> &mdash; page not found
				</div>
				<div className={boxBd}>
					<p>Sorry, I could not find that page. It may have moved or never existed.</p>
					<p>
						&middot; <Link href="/">go back home &raquo;</Link>
					</p>
				</div>
			</section>
		</Layout>
	);
}
