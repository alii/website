import {stripIndent} from 'common-tags';
import Link from 'next/link';
import {Highlighter, Shell} from '../../../../components/syntax-highligher';
import {Post} from '../../../Post';
import discordOAuthDashboardImage from './discord-oauth-dashboard.png';

export class ServerlessDiscordOAuth extends Post {
	public name = 'Serverless Discord OAuth with Next.js';
	public slug = 'serverless-discord-oauth';
	public date = new Date('2 January 2022');
	public excerpt = "Implementing basic Discord OAuth on Vercel's serverless platform";
	public hidden = false;
	public keywords = ['serverless', 'vercel', 'discord', 'oauth', 'node'];

	public render() {
		return (
			<>
				<h1 className="font-serif">Serverless Discord OAuth with Next.js</h1>

				<p>
					Oauth is is a brilliant solution to a difficult problem, but it can be hard to implement,
					especially in a serverless environment. Hopefully, this post will help you get started.
				</p>

				<p>
					Live demo:{' '}
					<Link href="/demos/serverless-discord-oauth">/demos/serverless-discord-oauth</Link>
				</p>

				<h2>The setup</h2>
				<p>
					Firstly, we're going to need to create a Next.js with TypeScript app. Feel free to skip
					this if you "have one that you made earlier".
				</p>
				<Shell>bun create next-app my-app --typescript</Shell>
				<h3>Dependencies</h3>
				<p>
					We will be relying on a few dependencies, the first is <code>discord-api-types</code>{' '}
					which provides up-to-date type definitions for Discord's API (who could've guessed). We'll
					also need <code>axios</code> (or whatever your favourite http lib is) to make requests to
					Discord. Additionally, we'll be encoding our user info into a JWT token & using the cookie
					package to serialize and send cookies down to the client. Finally, we'll use{' '}
					<code>dayjs</code> for basic date manipulation and <code>pathcat</code> to easily build
					urls with query params.
				</p>
				<Shell>
					{stripIndent`
						bun add axios cookie pathcat dayjs jsonwebtoken
						bun add --dev discord-api-types @types/jsonwebtoken @types/cookie
					`}
				</Shell>
				<h2>Code</h2>
				<p>Dope, you've made it this far already! Let's get some code written</p>
				<p>
					Firstly, you're going to want to open up the folder <code>pages/api</code> and create a
					new file. We can call it <code>oauth.ts</code>. The api folder is where Next.js will
					locate our serverless functions. Handily, I've written a library called{' '}
					<code>nextkit</code> that can assist us with this process but for the time being it's out
					of scope for this post – I'll eventually write a small migration guide.
				</p>
				<Highlighter filename="pages/api/oauth.ts">
					{stripIndent`
						import type {NextApiHandler} from 'next';
						import type {RESTGetAPIUserResult} from 'discord-api-types/v8';
						import {serialize} from 'cookie';
						import {sign} from 'jsonwebtoken';
						import dayjs from 'dayjs';
						import {pathcat} from 'pathcat';
						import axios from 'axios';

						// Configuration constants
						// TODO: Add these to environment variables
						const CLIENT_ID = 'CLIENT_ID';
						const CLIENT_SECRET = 'CLIENT_SECRET';
						const JWT_SECRET = 'CHANGE ME!!!';

						// The URL that we will redirect to
						// note: this should be an environment variable
						// but I'll cover that in part 2 since
						// it will work fine locally for the time being
						const REDIRECT_URI = 'http://localhost:3000/api/oauth';

						// Scopes we want to be able to access as a user
						const scope = ['identify'].join(' ');

						// URL to redirect to outbound (to request authorization)
						const OAUTH_URL = pathcat('https://discord.com/api/oauth2/authorize', {
							client_id: CLIENT_ID,
							redirect_uri: REDIRECT_URI,
							response_type: 'code',
							scope,
						});

						/**
						 * Exchanges an OAuth code for a full user object
						 * @param code The code from the callback querystring
						 */
						async function exchangeCode(code: string) {
							const body = new URLSearchParams({
								client_id: CLIENT_ID,
								client_secret: CLIENT_SECRET,
								redirect_uri: REDIRECT_URI,
								grant_type: 'authorization_code',
								code,
								scope,
							}).toString();

							const {data: auth} = await axios.post<{access_token: string; token_type: string}>(
								'https://discord.com/api/oauth2/token',
								body,
								{headers: {'Content-Type': 'application/x-www-form-urlencoded'}},
							);

							const {data: user} = await axios.get<RESTGetAPIUserResult>(
								'https://discord.com/api/users/@me',
								{headers: {Authorization: \`Bearer \${auth.access_token}\`}},
							);

							return {user, auth};
						}

						/**
						 * Generates the set-cookie header value from a given JWT token
						 */
						function getCookieHeader(token: string) {
							return serialize('token', token, {
								httpOnly: true,
								path: '/',
								secure: process.env.NODE_ENV !== 'development',
								expires: dayjs().add(1, 'day').toDate(),
								sameSite: 'lax',
							});
						}

						const handler: NextApiHandler = async (req, res) => {
							// Find our callback code from req.query
							const {code = null} = req.query as {code?: string};

							// If it doesn't exist, we need to redirect the user
							// so that we can get the code
							if (typeof code !== 'string') {
								res.redirect(OAUTH_URL);
								return;
							}

							// Exchange the code for a valid user object
							const {user} = await exchangeCode(code);

							// Sign a JWT token with the user's details
							// encoded into it
							const token = sign(user, JWT_SECRET, {expiresIn: '24h'});

							// Serialize a cookie and set it
							const cookie = getCookieHeader(token);
							res.setHeader('Set-Cookie', cookie);

							// Redirect the user to wherever we want
							// in our application
							res.redirect('/');
						};

						export default handler;
					`}
				</Highlighter>
				<p>
					Cool! This is the barebones that we will need to start writing our OAuth. It's quite a lot
					to bite but if you break it down line by line and read the comments, it should be fairly
					self-explanatory. We're still missing a few prerequesits to tell Discord who we are: the
					client id and secret.
				</p>

				<h3>Obtaining keys</h3>
				<p>
					Our tokens can be obtained by visiting{' '}
					<a href="https://discord.com/developers/applications" target="_blank" rel="noreferrer">
						discord.com/developers/applications
					</a>{' '}
					and registering a new application.
				</p>
				<img
					src={discordOAuthDashboardImage.src}
					alt="Screenshot of Discord's Developer OAuth page"
				/>
				<ol>
					<li>
						Copy and paste your client ID into your <code>oauth.ts</code> file
					</li>
					<li>
						Copy and paste your client secret into your <code>oauth.ts</code> file
					</li>
					<li>
						Add your redirect URI (<code>http://localhost:3000/api/oauth</code>) on the dashboard
					</li>
					<li>
						Make sure all your changes are saved and then we are ready to test it out for the first
						time!
					</li>
				</ol>

				<h2>Testing it</h2>
				<p>
					Awesome, we've got everything setup correctly. Now we can give it a quick spin. You can
					start your Next.js development server if you haven't already by running{' '}
					<code>bun dev</code> in your terminal, you should be able to navigate to{' '}
					<a target="_blank" href="http://localhost:3000/api/oauth" rel="noreferrer">
						localhost:3000/api/oauth
					</a>{' '}
					and successfully authenticate.
				</p>

				<p>
					Afterwards, if you open up your browser's devtools and check for the cookie section, you
					should see a cookie by the name of <code>token</code> – this is ours! Copy the value and
					paste it into{' '}
					<a href="https://jwt.io" target="_blank" rel="noreferrer">
						jwt.io
					</a>{' '}
					to decode it and see your details encoded inside it!
				</p>

				<h3>Why JWT?</h3>
				<p>
					We've picked JWT because it lets us store information on the client side where only the
					server can mutate and verify that the server created it. This means users cant modify the
					data inside a JWT token, allowing the server to make guarantees about the data encoded.
				</p>

				<h2>Environment variables</h2>
				<p>Okay, we're almost there. Final stretch</p>
				<p>
					Right now, we have our constants defined in this file which is fine for prototyping but it
					now means that if you want to push your code to github, for example, your client secret
					and perhaps other private information will be publicly available on your project's
					repository! The solution? Environment varibles.
				</p>
				<p>
					Environment variables are bits of information that are provided to a process at runtime,
					it means we don't have to store secrets inside of our source code.
				</p>
				<p>
					Thankfully, Next.js makes it super easy for us to use environment variables with something
					called an env file.
				</p>

				<h3>Creating our env file</h3>
				<p>
					Firstly, make a new file in your project's file structure called <code>.env</code> and add
					the content below. the format for env files is <code>KEY=value</code>. You can use{' '}
					<code>openssl rand -hex 64</code> to generate a JWT secret.
				</p>

				<Highlighter filename=".env">
					{stripIndent`
						CLIENT_ID=<our discord client id>
						CLIENT_SECRET=<our discord client secret>
						JWT_SECRET=<a secure, randomly generated string>
					`}
				</Highlighter>

				<p>
					And finally, we need to update our code to make sure that our <code>api/oauth.ts</code>{' '}
					file can use the newly generated environment variables.
				</p>
				<Highlighter filename="pages/api/oauth.ts">
					{stripIndent`
						// ...
						const CLIENT_ID = process.env.CLIENT_ID;
						const CLIENT_SECRET = process.env.CLIENT_SECRET;
						const JWT_SECRET = process.env.JWT_SECRET;
						// ...
					`}
				</Highlighter>

				<p>
					And that should be all good! I'll be writing a part two and three later on that will cover
					accessing the JWT from the server and also deployment to vercel.
				</p>

				<p>Thanks for reading!</p>
			</>
		);
	}
}
