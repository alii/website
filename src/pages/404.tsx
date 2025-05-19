import Link from 'next/link';
import {TbArrowLeft} from 'react-icons/tb';

export default function Page404() {
	return (
		<main className="mx-auto max-w-3xl space-y-4 py-20">
			<p className="font-serif text-xl text-sky-700 dark:text-sky-200">
				<span className="text-sky-600">404</span> Sorry, I could not find that page
			</p>

			<div>
				<Link
					href="/"
					className="flex w-fit items-center space-x-1.5 rounded-full bg-sky-100 px-4 py-2 text-sky-700 dark:bg-sky-950 dark:text-sky-500"
				>
					<TbArrowLeft className="inline" /> <span>Go home</span>
				</Link>
			</div>
		</main>
	);
}
