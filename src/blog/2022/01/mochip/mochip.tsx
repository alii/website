import {stripIndent} from 'common-tags';
import {Highlighter} from '../../../../components/syntax-highligher';
import {Post} from '../../../Post';
import emailFromColin from './email-from-colin.png';
import gmeet from './gmeet.png';
import goodbyeMochip from './goodbye-mochip.png';
import hegartyTimeExploit from './hegarty-time-exploit.jpeg';
import mochipLanding from './landing.jpeg';

export class Mochip extends Post {
	public name = 'Avoiding homework with code (and getting caught)';
	public slug = 'mochip';
	public date = new Date('6 Jan 2022');
	public excerpt = 'The eventful tale of me getting fed up with my homework';
	public hidden = false;
	public keywords = [
		'school',
		'homework',
		'clout',
		'hegarty maths',
		'educake',
		'homework hack',
		'maths homework',
		'programming',
	];

	public render() {
		return (
			<>
				<h1 className="font-serif italic">Avoiding homework with code (and getting caught)</h1>

				<p>
					Back in 2020, my school used a few online learning platforms that allowed
					professors/teachers to assign homework to students. I, as a lazy developer, wanted to
					spend more time playing games and writing code, especially when everyone was spending
					their time at home because of lockdown. I started writing this post in January of 2022,
					but I put off publicizing it for a while. It has been long enough since this all happened,
					so please sit back and enjoy.
				</p>

				<h2>The back story</h2>
				<p>
					Let's set the scene. 2018, my school introduces a new online homework platform for
					students. It's called HegartyMaths and it does a <i>lot</i>. It's fairly simple, teachers
					choose a topic to set for us as homework, with that we get a 10-15 minute
					tutorial/informational video on the subject (of which we have to write down notes whilst
					watching) and a shortish quiz to complete after finishing the video. It's a lot of work,
					especially the quiz, and in the worst cases can take up to an hour to complete one topic
					(bad).
				</p>
				<p>
					Mostly, software engineers are rather lazy individuals. We tell metal how to do stuff for
					us. Homework then, naturally, is an arduous task for a developer who is still at school.
					So, still 2018, a close friend of mine by the name of{' '}
					<a href="https://hiett.dev" target="_blank" rel="noreferrer">
						Scott Hiett
					</a>{' '}
					and I decided to do something about the Hegarty situation. We started to reverse engineer
					the frontend app and eventually came up with a Tampermonkey userscript that would glitch
					the embedded YouTube player to say that we'd watched the video at least 1x. Crucially, our
					teachers could see how many times we'd watched the video, so being able to skip up to 20
					minutes of homework time was especially useful – and it was a lot of fun to build too.
				</p>
				<p>
					So we flexed it on our Snapchat stories and had our school friends message us to use it
					blah blah. We eventually figured out that we could also set it to be watched over 9999x
					times; every time we did that our accounts were reset by the Hegarty team.
				</p>
				<h2>The first email</h2>
				<p>
					After this, we got in contact with our Math teacher in November of 2018 and got her to
					send an email to HegartyMaths informing them of our petty exploit and they got back to us
					very quickly.{' '}
					<span className="line-through">
						I don't have the original email anymore but I distinctly remember it saying something
						along the lines of "Stop trying to hack our platform and get back to doing your
						homework."
					</span>{' '}
					Edit: While writing this, I was able to uncover the deleted email from a photo we had
					taken of it in 2020. See below{' '}
					<span className="opacity-50">(certain details redacted for obvious reasons)</span>:
				</p>
				<img src={hegartyTimeExploit.src} alt="Hegarty Time Exploit Email" />
				<p>
					This response excited us a bit, as they were now aware of us messing around with the site
					and they had no intention of fixing the minor vuln we had anyway, so we kept using it. We
					had tried to build a script to answer the questions for us, but it was too much work at
					the time (complex data structures, weird API responses, etc etc).
				</p>
				<h2>Educake</h2>
				<p>
					For a while, students had access to another platform called Educake. Similar to
					HegartyMaths but targeting Biology, Chemistry and Physics. There was no video to watch at
					the beginning. We'd used it for a few years, in fact since I joined the school, but I'd
					never thought about reversing until all of this began.
				</p>
				<p>
					One common factor between Hegarty and Educake is that they immediately give you the
					correct answer if you got a question wrong. We took advantage of this and wrote a small
					node/mongo app & tampermonkey script to detect when a user was on a quiz page, answer
					every question with a random number, and then store the correct answer in mongodb. I don't
					have the original source but the TamperMonkey script was <i>probably something</i> like
					the following:
				</p>
				<Highlighter>
					{stripIndent`
						const guess = Math.random();

						const result = await post('/api/answer', {
							body: {
								answer: guess,
							},
						});

						await post('http://localhost:8080/save', {
							body: {
								question_id: question.id,
								answer: result.success ? guess : result.correct_answer,
							},
						});

						// Go to next question and repeat code above
						nextQuestion();
					`}
				</Highlighter>

				<p>
					As you can see, it was quite literally a loop through every question, saving the correct
					answer as we got it and moving on. Eventually I added a few more features to fetch from
					the database if we already had the right answer (meaning we don't answer{' '}
					<code>Math.random</code> every time) and also I added in support for multiple choice (so
					that we actually pick one of the possible answers rather than making it up – however I was
					surprised that the Educake backend would allow an answer that wasn't even in the possible
					choices).
				</p>

				<p>
					Now working on the project solo, I decided it would be time to build a nice UI for it all
					and bundle it all into a simple Tampermonkey script for both flexing rights on Snapchat
					(people constantly begging me to be able to use it was certainly ego fuel I hadn't
					experienced before) and also for myself to get out of homework I didn't want to do.
				</p>
				<p>
					The end result? A ~200 line codebase that scooped up all questions and answers on the site
					that could repeatedly get 100% on every single assignment and a 15mb mongo database.
				</p>

				<p>
					Below is a small video of what it all looked like. It also demonstrates a feature I added
					allowing for a "target percentage" — meaning users could get something other than 100% to
					look like more real/human score. Video was recorded on my Snapchat in November 2019.
				</p>

				<video controls src="/videos/mochip-educake.mp4" />

				<h2>Hegarty 2</h2>
				<p>
					The success of this script, along with pressure from my peers, led me to gain a lot of
					motivation to start working on reversing Hegarty again. I reached out to an internet
					friend who, for the sake of his privacy, will be named "Jake." He also used HegartyMaths
					at his school and was in the same boat as me trying to avoid doing our homework. Together,
					we managed to figure out how to answer many varying types of questions, including multiple
					choice and ordered answers, resulting in a huge amount of data stored. We had sacrificial
					user accounts and managed to answer 60,000 questions in a couple minutes, rocketing our
					way to the top of the HegartyMaths global leaderboard.{' '}
					<i>
						Would like to give a special shoutout to Boon for lending us his login and letting us
						decimate his statistics.
					</i>
				</p>
				<p>
					Together, Jake and I scraped the entirety of Hegarty's database and now had a JSON file
					that could be argued to be worth as much as Hegarty the company itself due to the entire
					product quite literally being the database we had copied.
				</p>
				<p>
					With this file, I wanted to take it a step further and allow my friends and other people
					to make good use of it without directly giving out the database (irresponsible)... And
					here Mochip was coined.
				</p>
				<h2>Mochip</h2>
				<p>
					So, where does Mochip tie in to this? Mochip was a Chrome extension, a collection of both
					our scraped Hegarty and scraped Educake databases sat behind a TypeScript API and a small
					React app. Hosted on Heroku free tier and MongoDB Atlas free tier, users could log in,
					enter a question (from either site) and get back a list of answers Mochip has for that
					question. Here's what the landing page looked like:
				</p>
				<img src={mochipLanding.src} alt="Screenshot of Mochip's main dashboard page" />
				<p>
					In the screenshot we can see a few stats on the right like total estimated time saved and
					how long you've had your account for. We gamified it a little just to keep people engaged
				</p>
				<p>
					Our chrome extension was made for Educake as they disabled copying question text with the
					clipboard. We re-enabled that just by clicking a button that was injected into the UI. The
					chrome extension is no longer on the chrome web store, but we've found that mirrors still
					have listings that we can't get taken down:{' '}
					<a href="https://extpose.com/ext/195388" target="_blank" rel="noreferrer">
						extpose.com/ext/195388
					</a>
				</p>
				<p>
					Our userbase grew so big that we ended up with a Discord server and even our own listing
					on Urban dictionary — I'm yet to find out who made it!{' '}
					<a
						href="https://www.urbandictionary.com/define.php?term=mochip"
						target="_blank"
						rel="noreferrer"
					>
						urbandictionary.com/define.php?term=mochip
					</a>
				</p>
				<p>
					Eventually we "rebranded" as I wanted to disassociate my name from the project.
					Unfortunately I do not have any screenshots from this era to show. I made an alt discord
					account and a few announcements saying we'd "passed on ownership" however this ineveitably
					only lasted for a couple weeks before we were rumbled.
				</p>
				<h2>Crashing down</h2>
				<p>
					All good things must come to and end, and Mochip's did after Scott posted about Mochip on
					his reddit account. Like any good CEO, Colin searches his company every now and then on
					Google to see what people are saying or doing and unfortunately came across our reddit
					post. He signed up (although under a different email) and tested out the app and was
					shocked to see it working. Shortly after this I received an email from Colin directly. See
					below
				</p>
				<img src={emailFromColin.src} alt="Email from Colin" />
				<p>
					I was upset but also a little content — it was sort of validation that I'd successfully
					made it and that catching the attention of Colin himself was sort of a good thing. We
					quickly scheduled a Google Meet, also inviting Scott, and I had one of the most memorable
					conversations of my life. I am extremely grateful for the advice Colin gave us in the
					call.
				</p>
				<img src={gmeet.src} alt="Screenshot of Google Meet" />
				<p>
					I'd like to give a special thank you to the legendary Colin Hegarty for his kindness and
					consideration when reaching out to me. Things could have gone a lot worse for me had this
					not been the case. HegartyMaths is a brilliant learning resource and at the end of the
					day, it's there to help students learn rather than be an inconvenience.
				</p>
				<p>
					Shortly after, Colin reached out to the Educake team, who we also scheduled a call with.
					We explained our complete methodology and suggested ways to prevent this in the future.
					The easiest fix from our point of view would be to implement an easy rate limit with Redis
					that would make it wildly infeasible to automate a test. The other thing we suggested was
					to scramble IDs in the database to invalidate <b>our</b> cloned database as much as
					possible (e.g. we only had the Hegarty IDs, so we could no longer reverse lookup a
					question).
				</p>

				<img src={goodbyeMochip.src} alt="My email replying to Colin" />

				<p>
					Thank you for reading, truly. Mochip was a real passion project and I had a wild time
					building it. ⭐
				</p>

				<hr />

				<p>
					<b>Edit 23 Sept, 2022</b>: After making this post public, I posted this on HackerNews and
					amazingly sat in the #1 spot overnight. This site consequently received a lot of traffic,
					and I served almost 1.5TB in just shy of 6 hours. Some of the employees at Sparx (the
					parent company of HegartyMaths) ended up seeing this and forwarded it to Colin. A few
					minutes ago I just received a really lovely email from Mr Hegarty himself with the subject
					"Congrats to you!" I am so grateful for the kindness and consideration Colin has shown
					Scott and me, so if you are a teacher reading this, then please consider using
					HegartyMaths at your school! This was the happy ending!
				</p>
			</>
		);
	}
}
