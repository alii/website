import attribute as a
import blog/post.{type Post, Post}
import html
import next/link
import react.{type Element}
import site/code
import site/date

pub fn post() -> Post {
  Post(
    name: "Serverless Discord OAuth with Next.js",
    slug: "serverless-discord-oauth",
    date: date.utc(2022, 1, 2),
    hidden: False,
    excerpt: "Implementing basic Discord OAuth on Vercel's serverless platform",
    keywords: ["next.js", "serverless", "discord", "oauth", "vercel"],
    body: body,
  )
}

fn body() -> Element {
  react.fragment([
    html.p([], [
      html.text(
        "OAuth is an elegant solution to a really difficult problem, but it can be hard to implement, especially in a serverless environment. Hopefully, this post will help you get started.",
      ),
    ]),
    html.p([], [
      html.text("Live demo:"),
      html.text(" "),
      link.link([a.href("/demos/serverless-discord-oauth")], [
        html.text("/demos/serverless-discord-oauth"),
      ]),
    ]),
    html.h2([], [html.text("The setup")]),
    html.p([], [
      html.text(
        "Firstly, we're going to need to create a Next.js with TypeScript app. Feel free to skip this if you \"have one that you made earlier.\"",
      ),
    ]),
    code.shell(
      "bun create next-app my-app --typescript",
      dollar_on_first_line_only: False,
    ),
    html.h3([], [html.text("Dependencies")]),
    html.p([], [
      html.text("We will be relying on a few dependencies, the first is "),
      html.code([], [html.text("discord-api-types")]),
      html.text(" "),
      html.text(
        "which provides up-to-date type definitions for Discord's API (who could've guessed). We'll also need ",
      ),
      html.code([], [html.text("axios")]),
      html.text(
        " (or whatever your favourite http lib is) to make requests to Discord. Additionally, we'll be encoding our user info into a JWT token & using the cookie package to serialize and send cookies down to the client. Finally, we'll use",
      ),
      html.text(" "),
      html.code([], [html.text("dayjs")]),
      html.text(" for basic date manipulation and "),
      html.code([], [html.text("pathcat")]),
      html.text(" to easily build urls with query params."),
    ]),
    code.shell(
      "bun add axios cookie pathcat dayjs jsonwebtoken
bun add --dev discord-api-types @types/jsonwebtoken",
      dollar_on_first_line_only: False,
    ),
    html.h2([], [html.text("Code")]),
    html.p([], [
      html.text(
        "Dope, you've made it this far already! Let's get some code written",
      ),
    ]),
    html.p([], [
      html.text("Firstly, you're going to want to open up the folder "),
      html.code([], [html.text("pages/api")]),
      html.text(" and create a new file. We can call it "),
      html.code([], [html.text("oauth.ts")]),
      html.text(
        ". The api folder is where Next.js will locate our serverless functions. Handily, I've written a library called",
      ),
      html.text(" "),
      html.code([], [html.text("nextkit")]),
      html.text(
        " that can assist us with this process but for the time being it's out of scope for this post – I'll eventually write a small migration guide.",
      ),
    ]),
    code.block(
      "import type {NextApiHandler} from 'next';
import type {RESTGetAPIUserResult} from 'discord-api-types/v8';
import {stringifySetCookie} from 'cookie';
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
		{headers: {Authorization: `Bearer ${auth.access_token}`}},
	);

	return {user, auth};
}

/**
 * Generates the set-cookie header value from a given JWT token
 */
function getSetCookieHeader(token: string) {
	return stringifySetCookie({
		name: 'token',
		value: token,
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
	const cookie = getSetCookieHeader(token);
	res.setHeader('Set-Cookie', cookie);

	// Redirect the user to wherever we want
	// in our application
	res.redirect('/');
};

export default handler;",
      code.TypeScript,
      [code.Filename("pages/api/oauth.ts")],
    ),
    html.p([], [
      html.text(
        "Cool! This is the bare bones that we will need to start writing our OAuth. It's quite a lot to bite, but if you break it down line by line and read the comments, it should be fairly self-explanatory. We're still missing a few prerequisites to tell Discord who we are: the client id and secret.",
      ),
    ]),
    html.h3([], [html.text("Obtaining keys")]),
    html.p([], [
      html.text("Our tokens can be obtained by visiting"),
      html.text(" "),
      html.a(
        [
          a.href("https://discord.com/developers/applications"),
          a.target("_blank"),
          a.rel("noreferrer"),
        ],
        [html.text("discord.com/developers/applications")],
      ),
      html.text(" "),
      html.text("and registering a new application."),
    ]),
    html.img([
      a.src(discord_o_auth_dashboard_image()),
      a.alt("Screenshot of Discord's Developer OAuth page"),
    ]),
    html.ol([], [
      html.li([], [
        html.text("Copy and paste your client ID into your "),
        html.code([], [html.text("oauth.ts")]),
        html.text(" file"),
      ]),
      html.li([], [
        html.text("Copy and paste your client secret into your "),
        html.code([], [html.text("oauth.ts")]),
        html.text(" file"),
      ]),
      html.li([], [
        html.text("Add your redirect URI ("),
        html.code([], [html.text("http://localhost:3000/api/oauth")]),
        html.text(") on the dashboard"),
      ]),
      html.li([], [
        html.text(
          "Make sure all your changes are saved and then we are ready to test it out for the first time!",
        ),
      ]),
    ]),
    html.h2([], [html.text("Testing it")]),
    html.p([], [
      html.text(
        "Awesome, we've got everything setup correctly. Now we can give it a quick spin. You can start your Next.js development server if you haven't already by running",
      ),
      html.text(" "),
      html.code([], [html.text("bun dev")]),
      html.text(" in your terminal, you should be able to navigate to"),
      html.text(" "),
      html.a(
        [
          a.target("_blank"),
          a.href("http://localhost:3000/api/oauth"),
          a.rel("noreferrer"),
        ],
        [html.text("localhost:3000/api/oauth")],
      ),
      html.text(" "),
      html.text("and successfully authenticate."),
    ]),
    html.p([], [
      html.text(
        "Afterwards, if you open up your browser's devtools and check for the cookie section, you should see a cookie by the name of ",
      ),
      html.code([], [html.text("token")]),
      html.text(" – this is ours! Copy the value and paste it into"),
      html.text(" "),
      html.a(
        [a.href("https://jwt.io"), a.target("_blank"), a.rel("noreferrer")],
        [html.text("jwt.io")],
      ),
      html.text(" "),
      html.text("to decode it and see your details encoded inside it!"),
    ]),
    html.h3([], [html.text("Why JWT?")]),
    html.p([], [
      html.text(
        "We've picked JWT because it lets us store information on the client side where only the server can mutate and verify that the server created it. This means users can't modify the data inside a JWT token, allowing the server to make guarantees about the data encoded.",
      ),
    ]),
    html.h2([], [html.text("Environment variables")]),
    html.p([], [html.text("Okay, we're almost there. Final stretch")]),
    html.p([], [
      html.text(
        "Right now, we have our constants defined in this file which is fine for prototyping but it now means that if you want to push your code to github, for example, your client secret and perhaps other private information will be publicly available on your project's repository! The solution? Environment varibles.",
      ),
    ]),
    html.p([], [
      html.text(
        "Environment variables are bits of information that are provided to a process at runtime. It means we don't have to store secrets inside our source code.",
      ),
    ]),
    html.p([], [
      html.text(
        "Thankfully, Next.js makes it super easy for us to use environment variables with something called an env file.",
      ),
    ]),
    html.h3([], [html.text("Creating our env file")]),
    html.p([], [
      html.text(
        "Firstly, make a new file in your project's file structure called ",
      ),
      html.code([], [html.text(".env")]),
      html.text(" and add the content below. The format for env files is "),
      html.code([], [html.text("KEY=value")]),
      html.text(". You can use"),
      html.text(" "),
      html.code([], [html.text("openssl rand -hex 64")]),
      html.text(" to generate a JWT secret."),
    ]),
    code.block(
      "CLIENT_ID=<our discord client id>
CLIENT_SECRET=<our discord client secret>
JWT_SECRET=<a secure, randomly generated string>",
      code.TypeScript,
      [code.Filename(".env")],
    ),
    html.p([], [
      html.text("Finally, we need to update our code to make sure that our "),
      html.code([], [html.text("api/oauth.ts")]),
      html.text(" file can use the newly generated environment variables."),
    ]),
    code.block(
      "// ...
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;
// ...",
      code.TypeScript,
      [code.Filename("pages/api/oauth.ts")],
    ),
    html.p([], [
      html.text(
        "And that should be all good! I'll be writing a part two and three later on that will cover accessing the JWT from the server and also deployment to vercel.",
      ),
    ]),
    html.p([], [html.text("Thanks for reading!")]),
  ])
}

@external(javascript, "./serverless_discord_oauth_ffi.ts", "discordOAuthDashboardImage")
fn discord_o_auth_dashboard_image() -> String
