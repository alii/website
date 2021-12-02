import {useRouter} from 'next/router';
import {APIResponse} from 'nextkit';
import React from 'react';
import {toast} from 'react-hot-toast';
import {HiOutlineMail} from 'react-icons/hi';
import {RiSendPlane2Line} from 'react-icons/ri';
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
				<div className="bg-white bg-opacity-5 p-5 rounded-lg">
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
							<span className="text-white text-opacity-50 tracking-wide uppercase text-sm font-bold">
								Email Address
							</span>

							<input
								required
								type="email"
								name="email"
								id="email"
								className="bg-white text-lg block w-full font-sans bg-opacity-5 px-4 py-1 rounded-md focus:outline-none focus:ring"
							/>
						</label>

						<label htmlFor="body" className="block">
							<span className="text-white text-opacity-50 tracking-wide uppercase text-sm font-bold">
								Your message
							</span>

							<textarea
								rows={5}
								name="body"
								id="body"
								className="bg-white text-lg block w-full font-sans bg-opacity-5 px-4 py-1 rounded-md resize-none focus:outline-none focus:ring"
							/>
						</label>

						<div className="pt-2 block">
							<button
								type="submit"
								className="text-lg bg-white bg-opacity-5 rounded-full px-8 py-2 inline-flex space-x-2 items-center hover:bg-opacity-10 focus:outline-none focus:ring"
							>
								<span>Send</span> <RiSendPlane2Line />
							</button>
						</div>
					</form>
				</div>

				<div>
					<ul className="list-disc list-inside space-y-2">
						<ListItem icon={HiOutlineMail} text="hi@alistair.sh" />
						<ListItem icon={SiDiscord} text="alistair#9999" />
						<ListItem icon={SiTwitter} text="alistaiiiir" />
					</ul>
				</div>
			</div>
		</div>
	);
}
