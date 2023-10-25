import {Turnstile} from '@marsidev/react-turnstile';
import {useState} from 'react';
import toast from 'react-hot-toast';

export function ContactForm() {
	const [submitted, setSubmitted] = useState(false);
	const [loading, setLoading] = useState(false);

	if (submitted) {
		return (
			<div>
				<h2 className="text-2xl">Message received</h2>
				<p className="text-black/80">I'll get back to you as soon as possible</p>
			</div>
		);
	}

	return (
		<>
			<div className="space-y-1">
				<h2 className="font-semibold">Let's talk 📬</h2>
				<p className="text-black/75">
					Drop me a message with the form below, I'll get back to the non-spam
				</p>
			</div>

			<form
				onSubmit={async event => {
					event.preventDefault();

					const values = Object.fromEntries(
						new FormData(event.target as HTMLFormElement).entries(),
					);

					setLoading(true);

					const promise = fetch('/api/contact', {
						headers: {'Content-Type': 'application/json'},
						body: JSON.stringify(values),
						method: 'POST',
					});

					await toast
						.promise(promise, {
							success: 'Success!',
							loading: 'Sending...',
							error: (error: Error) => error?.message ?? 'Something went wrong...',
						})
						.then(async () => {
							setSubmitted(true);
						})
						.catch(() => null)
						.finally(() => {
							setLoading(false);
						});
				}}
				method="POST"
				action="/api/contact"
				className="space-y-2 [&>label]:block [&_input]:rounded-md [&_textarea]:rounded-md"
			>
				<label htmlFor="email">
					<input
						type="email"
						name="email"
						id="email"
						required
						placeholder="hi@alistair.sh"
						className="w-full"
					/>
				</label>

				<label htmlFor="body">
					<textarea
						id="body"
						name="body"
						rows={5}
						minLength={10}
						required
						placeholder="Your message"
						className="w-full resize-y"
					/>
				</label>

				<Turnstile
					options={{responseFieldName: 'turnstile'}}
					style={{display: 'none'}}
					siteKey="0x4AAAAAAABwxsgAijQAi5FS"
				/>

				<button
					disabled={loading}
					type="submit"
					className="relative float-right w-1/2 overflow-hidden rounded-md bg-black p-2 text-white"
				>
					Send
					{loading && (
						<span className="absolute inset-0 flex items-center justify-center bg-black">
							<span className="h-4 w-4 animate-spin rounded-[50%] border-2 border-white/0 border-l-white border-t-white" />
						</span>
					)}
				</button>
			</form>
		</>
	);
}
