import Link from 'next/link';

export default function Page404() {
	return (
		<main className="mx-auto max-w-3xl space-y-2 px-6 pb-40 pt-16">
			<p className="font-title text-3xl">404</p>
			<p>Sorry, I couldn't locate that page for ya</p>

			<div>
				<Link href="/" className="rounded-full bg-pink-500 px-2 py-1">
					↖ home
				</Link>
			</div>
		</main>
	);
}
