import {useRouter} from 'next/router';
import {APIResponse} from 'nextkit';
import React from 'react';
import {toast} from 'react-hot-toast';
import {HiOutlineMail} from 'react-icons/hi';
import {RiSendPlane2Line, RiPhoneLine} from 'react-icons/ri';
import {SiDiscord, SiTwitter} from 'react-icons/si';
import {ListItem} from '../components/list-item';
import {fetcher} from '../util/fetcher';

export default function Talk() {
	const router = useRouter();

	return (
		<div className="space-y-4">
			<h1 className="text-2xl sm:text-3xl font-bold">Let's talk 💬</h1>
			<p>
				Leave a message on the form below or get in touch through Discord,
				Twitter or email.
			</p>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="p-5 bg-white bg-opacity-5 rounded-lg">
					<form
						className="space-y-2"
						action="/api/form"
						method="POST"
						onSubmit={async event => {
							event.preventDefault();

							const values = Object.fromEntries(
								new FormData(event.target as HTMLFormElement).entries(),
							);

							const promise = fetcher<APIResponse<{sent: true}>>('/api/form', {
								headers: {'Content-Type': 'application/json'},
								body: JSON.stringify(values),
								method: 'POST',
							});

							await toast
								.promise(promise, {
									success: 'Success!',
									loading: 'Sending...',
									error: (error: Error) =>
										error?.message ?? 'Something went wrong...',
								})
								.then(async () => router.push('/thanks'))
								.catch(() => null);
						}}
					>
						<label htmlFor="email" className="block">
							<span className="text-sm font-bold tracking-wide text-white text-opacity-50 uppercase select-none">
								Email Address
							</span>

							<input
								required
								type="email"
								name="email"
								id="email"
								className="block py-1 px-4 w-full font-sans text-lg bg-white bg-opacity-5 rounded-md focus:ring focus:outline-none"
							/>
						</label>

						<label htmlFor="body" className="block">
							<span className="text-sm font-bold tracking-wide text-white text-opacity-50 uppercase select-none">
								Your message
							</span>

							<textarea
								rows={5}
								name="body"
								id="body"
								className="block py-1 px-4 w-full font-sans text-lg bg-white bg-opacity-5 rounded-md focus:ring focus:outline-none resize-none"
							/>
						</label>

						<div className="block pt-2">
							<button
								type="submit"
								className="inline-flex items-center py-2 px-8 space-x-2 text-lg bg-white bg-opacity-5 hover:bg-opacity-10 rounded-full focus:ring focus:outline-none"
							>
								<span>Send</span> <RiSendPlane2Line />
							</button>
						</div>
					</form>
				</div>

				<div>
					<ul className="space-y-2 list-disc list-inside">
						<ListItem icon={HiOutlineMail} text="hi@alistair.sh" />
						<ListItem icon={SiDiscord} text="alistair#9999" />
						<ListItem icon={SiTwitter} text="alistaiiiir" />
						<ListItem icon={RiPhoneLine} text="+1 (424) 395-8523" />
					</ul>
				</div>
			</div>
		</div>
	);
}
