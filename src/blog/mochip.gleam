import attribute as a
import blog/post.{type Post, Post}
import html
import react.{type Element}
import site/code
import site/date

pub fn post() -> Post {
  Post(
    name: "Avoiding homework with code (and getting caught)",
    slug: "mochip",
    date: date.utc(2022, 1, 6),
    hidden: False,
    excerpt: "The eventful tale of me getting fed up with my homework",
    keywords: [
      "web scraping",
      "reverse engineering",
      "browser extension",
      "school",
    ],
    body: body,
  )
}

fn body() -> Element {
  react.fragment([
    html.p([], [
      html.text(
        "Back in 2020, my school used a few online learning platforms that allowed professors/teachers to assign homework to students. I, as a lazy developer, wanted to spend more time playing games and writing code, especially when everyone was spending their time at home because of lockdown. I started writing this post in January of 2022, but I put off publicizing it for a while. It has been long enough since this all happened, so please sit back and enjoy.",
      ),
    ]),
    html.h2([], [html.text("The back story")]),
    html.p([], [
      html.text(
        "Let's set the scene. 2018, my school introduces a new online homework platform for students. It's called HegartyMaths and it does a ",
      ),
      html.i([], [html.text("lot")]),
      html.text(
        ". It's fairly simple, teachers choose a topic to set for us as homework, with that we get a 10-15 minute tutorial/informational video on the subject (of which we have to write down notes whilst watching) and a shortish quiz to complete after finishing the video. It's a lot of work, especially the quiz, and in the worst cases can take up to an hour to complete one topic (bad).",
      ),
    ]),
    html.p([], [
      html.text(
        "Mostly, software engineers are rather lazy individuals. We tell metal how to do stuff for us. Homework then, naturally, is an arduous task for a developer who is still at school. So, still 2018, a close friend of mine by the name of",
      ),
      html.text(" "),
      html.a(
        [a.href("https://hiett.dev"), a.target("_blank"), a.rel("noreferrer")],
        [html.text("Scott Hiett")],
      ),
      html.text(" "),
      html.text(
        "and I decided to do something about the Hegarty situation. We started to reverse engineer the frontend app and eventually came up with a Tampermonkey userscript that would glitch the embedded YouTube player to say that we'd watched the video at least 1x. Crucially, our teachers could see how many times we'd watched the video, so being able to skip up to 20 minutes of homework time was especially useful – and it was a lot of fun to build too.",
      ),
    ]),
    html.p([], [
      html.text(
        "So we flexed it on our Snapchat stories and had our school friends message us to use it blah blah. We eventually figured out that we could also set it to be watched over 9999x times; every time we did that our accounts were reset by the Hegarty team.",
      ),
    ]),
    html.h2([], [html.text("The first email")]),
    html.p([], [
      html.text(
        "After this, we got in contact with our Math teacher in November of 2018 and got her to send an email to HegartyMaths informing them of our petty exploit and they got back to us very quickly.",
      ),
      html.text(" "),
      html.span([a.class("line-through")], [
        html.text(
          "I don't have the original email anymore but I distinctly remember it saying something along the lines of \"Stop trying to hack our platform and get back to doing your homework.\"",
        ),
      ]),
      html.text(" "),
      html.text(
        "Edit: While writing this, I was able to uncover the deleted email from a photo we had taken of it in 2020. See below",
      ),
      html.text(" "),
      html.span([a.class("opacity-50")], [
        html.text("(certain details redacted for obvious reasons)"),
      ]),
      html.text(":"),
    ]),
    html.img([
      a.src(hegarty_time_exploit()),
      a.alt("Hegarty Time Exploit Email"),
    ]),
    html.p([], [
      html.text(
        "This response excited us a bit, as they were now aware of us messing around with the site and they had no intention of fixing the minor vuln we had anyway, so we kept using it. We had tried to build a script to answer the questions for us, but it was too much work at the time (complex data structures, weird API responses, etc etc).",
      ),
    ]),
    html.h2([], [html.text("Educake")]),
    html.p([], [
      html.text(
        "For a while, students had access to another platform called Educake. Similar to HegartyMaths but targeting Biology, Chemistry and Physics. There was no video to watch at the beginning. We'd used it for a few years, in fact since I joined the school, but I'd never thought about reversing until all of this began.",
      ),
    ]),
    html.p([], [
      html.text(
        "One common factor between Hegarty and Educake is that they immediately give you the correct answer if you got a question wrong. We took advantage of this and wrote a small node/mongo app & tampermonkey script to detect when a user was on a quiz page, answer every question with a random number, and then store the correct answer in mongodb. I don't have the original source but the TamperMonkey script was ",
      ),
      html.i([], [html.text("probably something")]),
      html.text(" like the following:"),
    ]),
    code.block(
      "const guess = Math.random();

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
nextQuestion();",
      code.TypeScript,
      [],
    ),
    html.p([], [
      html.text(
        "As you can see, it was quite literally a loop through every question, saving the correct answer as we got it and moving on. Eventually I added a few more features to fetch from the database if we already had the right answer (meaning we don't answer",
      ),
      html.text(" "),
      html.code([], [html.text("Math.random")]),
      html.text(
        " every time) and also I added in support for multiple choice (so that we actually pick one of the possible answers rather than making it up – however I was surprised that the Educake backend would allow an answer that wasn't even in the possible choices).",
      ),
    ]),
    html.p([], [
      html.text(
        "Now working on the project solo, I decided it would be time to build a nice UI for it all and bundle it all into a simple Tampermonkey script for both flexing rights on Snapchat (people constantly begging me to be able to use it was certainly ego fuel I hadn't experienced before) and also for myself to get out of homework I didn't want to do.",
      ),
    ]),
    html.p([], [
      html.text(
        "The end result? A ~200 line codebase that scooped up all questions and answers on the site that could repeatedly get 100% on every single assignment and a 15mb mongo database.",
      ),
    ]),
    html.p([], [
      html.text(
        "Below is a small video of what it all looked like. It also demonstrates a feature I added allowing for a \"target percentage\" — meaning users could get something other than 100% to look like more real/human score. Video was recorded on my Snapchat in November 2019.",
      ),
    ]),
    html.video(
      [a.flag("controls", True), a.src("/videos/mochip-educake.mp4")],
      [],
    ),
    html.h2([], [html.text("Hegarty 2")]),
    html.p([], [
      html.text(
        "The success of this script, along with pressure from my peers, led me to gain a lot of motivation to start working on reversing Hegarty again. I reached out to an internet friend who, for the sake of his privacy, will be named \"Jake.\" He also used HegartyMaths at his school and was in the same boat as me trying to avoid doing our homework. Together, we managed to figure out how to answer many varying types of questions, including multiple choice and ordered answers, resulting in a huge amount of data stored. We had sacrificial user accounts and managed to answer 60,000 questions in a couple minutes, rocketing our way to the top of the HegartyMaths global leaderboard.",
      ),
      html.text(" "),
      html.i([], [
        html.text(
          "Would like to give a special shoutout to Boon for lending us his login and letting us decimate his statistics.",
        ),
      ]),
    ]),
    html.p([], [
      html.text(
        "Together, Jake and I scraped the entirety of Hegarty's database and now had a JSON file that could be argued to be worth as much as Hegarty the company itself due to the entire product quite literally being the database we had copied.",
      ),
    ]),
    html.p([], [
      html.text(
        "With this file, I wanted to take it a step further and allow my friends and other people to make good use of it without directly giving out the database (irresponsible)... And here Mochip was coined.",
      ),
    ]),
    html.h2([], [html.text("Mochip")]),
    html.p([], [
      html.text(
        "So, where does Mochip tie in to this? Mochip was a Chrome extension, a collection of both our scraped Hegarty and scraped Educake databases sat behind a TypeScript API and a small React app. Hosted on Heroku free tier and MongoDB Atlas free tier, users could log in, enter a question (from either site) and get back a list of answers Mochip has for that question. Here's what the landing page looked like:",
      ),
    ]),
    html.img([
      a.src(mochip_landing()),
      a.alt("Screenshot of Mochip's main dashboard page"),
    ]),
    html.p([], [
      html.text(
        "In the screenshot we can see a few stats on the right like total estimated time saved and how long you've had your account for. We gamified it a little just to keep people engaged",
      ),
    ]),
    html.p([], [
      html.text(
        "Our chrome extension was made for Educake as they disabled copying question text with the clipboard. We re-enabled that just by clicking a button that was injected into the UI. The chrome extension is no longer on the chrome web store, but we've found that mirrors still have listings that we can't get taken down:",
      ),
      html.text(" "),
      html.a(
        [
          a.href("https://extpose.com/ext/195388"),
          a.target("_blank"),
          a.rel("noreferrer"),
        ],
        [html.text("extpose.com/ext/195388")],
      ),
    ]),
    html.p([], [
      html.text(
        "Our userbase grew so big that we ended up with a Discord server and even our own listing on Urban dictionary — I'm yet to find out who made it!",
      ),
      html.text(" "),
      html.a(
        [
          a.href("https://www.urbandictionary.com/define.php?term=mochip"),
          a.target("_blank"),
          a.rel("noreferrer"),
        ],
        [html.text("urbandictionary.com/define.php?term=mochip")],
      ),
    ]),
    html.p([], [
      html.text(
        "Eventually we \"rebranded\" as I wanted to disassociate my name from the project. Unfortunately I do not have any screenshots from this era to show. I made an alt discord account and a few announcements saying we'd \"passed on ownership\" however this ineveitably only lasted for a couple weeks before we were rumbled.",
      ),
    ]),
    html.h2([], [html.text("Crashing down")]),
    html.p([], [
      html.text(
        "All good things must come to and end, and Mochip's did after Scott posted about Mochip on his reddit account. Like any good CEO, Colin searches his company every now and then on Google to see what people are saying or doing and unfortunately came across our reddit post. He signed up (although under a different email) and tested out the app and was shocked to see it working. Shortly after this I received an email from Colin directly. See below",
      ),
    ]),
    html.img([a.src(email_from_colin()), a.alt("Email from Colin")]),
    html.p([], [
      html.text(
        "I was upset but also a little content — it was sort of validation that I'd successfully made it and that catching the attention of Colin himself was sort of a good thing. We quickly scheduled a Google Meet, also inviting Scott, and I had one of the most memorable conversations of my life. I am extremely grateful for the advice Colin gave us in the call.",
      ),
    ]),
    html.img([a.src(gmeet()), a.alt("Screenshot of Google Meet")]),
    html.p([], [
      html.text(
        "I'd like to give a special thank you to the legendary Colin Hegarty for his kindness and consideration when reaching out to me. Things could have gone a lot worse for me had this not been the case. HegartyMaths is a brilliant learning resource and at the end of the day, it's there to help students learn rather than be an inconvenience.",
      ),
    ]),
    html.p([], [
      html.text(
        "Shortly after, Colin reached out to the Educake team, who we also scheduled a call with. We explained our complete methodology and suggested ways to prevent this in the future. The easiest fix from our point of view would be to implement an easy rate limit with Redis that would make it wildly infeasible to automate a test. The other thing we suggested was to scramble IDs in the database to invalidate ",
      ),
      html.b([], [html.text("our")]),
      html.text(
        " cloned database as much as possible (e.g. we only had the Hegarty IDs, so we could no longer reverse lookup a question).",
      ),
    ]),
    html.img([a.src(goodbye_mochip()), a.alt("My email replying to Colin")]),
    html.p([], [
      html.text(
        "Thank you for reading, truly. Mochip was a real passion project and I had a wild time building it. ⭐",
      ),
    ]),
    html.hr([]),
    html.p([], [
      html.b([], [html.text("Edit 23 Sept, 2022")]),
      html.text(
        ": After making this post public, I posted this on HackerNews and amazingly sat in the #1 spot overnight. This site consequently received a lot of traffic, and I served almost 1.5TB in just shy of 6 hours. Some of the employees at Sparx (the parent company of HegartyMaths) ended up seeing this and forwarded it to Colin. A few minutes ago I just received a really lovely email from Mr Hegarty himself with the subject \"Congrats to you!\" I am so grateful for the kindness and consideration Colin has shown Scott and me, so if you are a teacher reading this, then please consider using HegartyMaths at your school! This was the happy ending!",
      ),
    ]),
  ])
}

@external(javascript, "./mochip_ffi.ts", "hegartyTimeExploit")
fn hegarty_time_exploit() -> String

@external(javascript, "./mochip_ffi.ts", "mochipLanding")
fn mochip_landing() -> String

@external(javascript, "./mochip_ffi.ts", "emailFromColin")
fn email_from_colin() -> String

@external(javascript, "./mochip_ffi.ts", "gmeet")
fn gmeet() -> String

@external(javascript, "./mochip_ffi.ts", "goodbyeMochip")
fn goodbye_mochip() -> String
