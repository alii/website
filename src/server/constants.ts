export const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK ?? '';

if (!DISCORD_WEBHOOK) {
	throw new Error(
		'No DISCORD_WEBHOOK environment variable was provided. Contact form will not work.',
	);
}
