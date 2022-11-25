import {useRouter} from 'next/router';
import {toast} from 'react-hot-toast';
import {HiOutlineMail} from 'react-icons/hi';
import {RiPhoneLine, RiSendPlane2Line} from 'react-icons/ri';
import {SiDiscord, SiTwitter} from 'react-icons/si';
import {useLanyard, type Data} from 'use-lanyard';
import {ListItemReversed} from '../components/list-item';
import {DISCORD_ID} from '../components/song';
import {fetcher} from '../util/fetcher';

const statusMap: Record<Data['discord_status'], string> = {
	online: 'bg-green-500',
	idle: 'bg-yellow-500',
	dnd: 'bg-red-500',
	offline: 'bg-neutral-500',
};

export default function Talk() {
	const router = useRouter();
	const {data: lanyard} = useLanyard(DISCORD_ID);

	return (
		<div className="space-y-4">
			<h1 className="text-2xl font-bold sm:text-3xl">Let's talk 💬</h1>
			<p>
				Leave a message on the form below or get in touch through Discord,
				Twitter or email.
			</p>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div>
					<form
						className="space-y-2"
						action="/api/form"
						method="POST"
						onSubmit={async event => {
							event.preventDefault();

							const values = Object.fromEntries(
								new FormData(event.target as HTMLFormElement).entries(),
							);

							const promise = fetcher('/api/talk', {
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
							<span className="select-none text-sm font-bold uppercase tracking-wide text-opacity-50 dark:text-white">
								Email Address
							</span>

							<input
								required
								type="email"
								name="email"
								id="email"
								className="block w-full rounded-md bg-neutral-200/50 py-1 px-4 font-sans text-lg focus:outline-none focus:ring dark:bg-white/5"
							/>
						</label>

						<label htmlFor="body" className="block">
							<span className="select-none text-sm font-bold uppercase tracking-wide text-opacity-50 dark:text-white">
								Your message
							</span>

							<textarea
								rows={5}
								name="body"
								minLength={10}
								id="body"
								className="block w-full resize-none rounded-md bg-neutral-200/50 py-1 px-4 font-sans text-lg focus:outline-none focus:ring dark:bg-white/5"
							/>
						</label>

						<div className="block pt-2">
							<button
								type="submit"
								className="inline-flex items-center space-x-2 rounded-full bg-blue-700 py-2 px-8 text-lg text-blue-100 focus:outline-none focus:ring dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
							>
								<span>Send</span> <RiSendPlane2Line />
							</button>
						</div>
					</form>
				</div>

				<div>
					<ul className="list-inside list-disc space-y-2 pt-5 md:float-right">
						<ListItemReversed icon={HiOutlineMail} text="hi@alistair.sh" />
						<ListItemReversed
							icon={SiDiscord}
							text={
								lanyard ? (
									<span className="flex items-center space-x-1">
										<span
											className={`${
												statusMap[lanyard.discord_status]
											} inline-block h-2 w-2 rounded-full`}
										/>

										<span>
											{lanyard.discord_user.username}#
											{lanyard.discord_user.discriminator}
										</span>
									</span>
								) : null
							}
						/>
						<ListItemReversed icon={SiTwitter} text="alistaiir" />
						<ListItemReversed icon={RiPhoneLine} text="+1 (424) 395-8523" />
					</ul>
				</div>
			</div>
		</div>
	);
}
