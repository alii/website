import Link from 'next/link';

export default function Page404() {
	return (
		<main className="mx-auto max-w-3xl space-y-2 px-6 pb-40 pt-16">
			<p className="font-serif text-3xl">404 not found</p>
			<p>sorry, this is either not finished yet, or it never existed in the first place</p>

			<div>
				<Link
					href="/"
					className="inline-block rounded-full bg-neutral-200 px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
				>
					↖ back to home
				</Link>
			</div>
		</main>
	);
}