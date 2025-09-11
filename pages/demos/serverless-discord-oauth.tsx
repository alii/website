import type {APIUser} from 'discord-api-types/v10';
import {verify} from 'jsonwebtoken';
import type {GetServerSideProps, PageConfig} from 'next';
import Link from 'next/link';
import {env} from '../../src/server/env';

interface Props {
	readonly user: APIUser | null;
}

export const config: PageConfig = {
	unstable_runtimeJS: false,
};

export default function ServerlessDiscordOAuthDemoPage({user}: Props) {
	if (!user) {
		return (
			<div className="mx-auto max-w-md py-20">
				<h1>you are not signed in!</h1>

				<Link className="text-blue-500 dark:text-blue-300" href="/api/oauth">
					Log in with Discord ↗
				</Link>
			</div>
		);
	}

	const avatar_url = user.avatar
		? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`
		: user.discriminator === '0'
			? `https://cdn.discordapp.com/embed/avatars/${(BigInt(user.id) >> BigInt(22)) % BigInt(6)}.png`
			: `https://cdn.discordapp.com/embed/avatars/${Number(user.discriminator) % 5}.png`;

	return (
		<div className="mx-auto max-w-md py-20">
			<img src={avatar_url} alt={`Avatar URL for ${user.username}.`} />

			<h1>hello, {user.username}!</h1>

			<p>clear your cookies to logout!</p>
		</div>
	);
}

export const getServerSideProps: GetServerSideProps<Props> = async ctx => {
	const {token = null} = ctx.req.cookies;

	if (!token) {
		return {
			props: {user: null},
		};
	}

	return {
		props: {
			user: verify(token, env.DISCORD_DEMO_JWT_SECRET) as APIUser,
		},
	};
};
