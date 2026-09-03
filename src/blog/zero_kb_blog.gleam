import attribute as a
import blog/post.{type Post, Post}
import gleam/option.{Some}
import html
import react.{type Element}
import site/code
import site/date
import site/note

pub fn post() -> Post {
  Post(
    name: "The 0kb Next.js blog",
    slug: "zero-kb-nextjs-blog",
    date: date.utc(2022, 1, 6),
    hidden: False,
    excerpt: "How I shipped a Next.js app with a 0kb bundle",
    keywords: ["next.js", "performance", "bundle size", "ssg"],
    body: body,
  )
}

fn body() -> Element {
  react.fragment([
    html.h1([a.class("font-serif italic")], [html.text("The 0kb Next.js blog")]),
    note.note(note.Warning, Some("Update 3rd April 2023"), [
      html.text("This only applies to apps using the "),
      html.code([], [html.text("pages")]),
      html.text(
        " directory of Next.js as App Dir (released in v13) does not support the settings used here. RSCs offer a similar idealogy of rendering components on the server only, while also allowing for client side JS.",
      ),
    ]),
    html.p([], [
      html.text("Ok so the title was a "),
      html.i([], [html.text("liiittle")]),
      html.text(
        " bit clickbaity, but it's not technically a lie. This entire website has zero JavaScript on ",
      ),
      html.i([], [html.text("every single page")]),
      html.text(
        "... a Next.js app with zero client side JS. How can this be possible?",
      ),
    ]),
    html.h2([], [html.text("Some context")]),
    html.p([], [
      html.text("Next.js is a huge abstraction of "),
      html.code([], [html.text("react-dom/server")]),
      html.text(
        " and other helpful utilities for building server side rendered apps powered by React. It's really easy to get started with, and features things like file system routing, statically generated content and much much more. The most important thing to understand here is that there's a server...",
      ),
    ]),
    html.p([], [
      html.text("For those of you who are not familiar with React, it's a "),
      html.b([], [html.text("JavaScript")]),
      html.text(
        " framework for building user interfaces. It handles the view layer of an app and is used to render the UI. Next.js takes this a step further and allows you to write your own view layer to have the first render performed on a server, which allows for a lot of performance and UI optimizations because we can ship back a lot less to the client (foreshadowing).",
      ),
    ]),
    html.h2([], [html.text("Runtime JS")]),
    html.p([], [
      html.text("With something called "),
      html.code([], [html.text("PageConfig")]),
      html.text(
        ", we can instruct Next.js to supply zero runtime JS to the client. It comes with a couple of trade-offs, but the general idea is that we perform our first render on the server and the resulting HTML and CSS is \"frozen\" and sent down to the client over the wire. Zero JavaScript runtime in the browser, no",
      ),
      html.text(" "),
      html.code([], [html.text("<script>")]),
      html.text(" tags in sight!"),
    ]),
    html.h2([], [html.text("What's the catch?")]),
    html.p([], [
      html.text(
        "As the saying goes, there's no such thing as a free lunch. As with anything, doing this comes with some trade-offs. For example, Next has a lot of built-in React components that can speed up not only your app, but also development speed. Using the zero kb mode, we unfortunately cannot make full use of the ",
      ),
      html.code([], [html.text("next/link")]),
      html.text(
        " component; a component that prefetches pages so that clicks on links don't cause a full page reload. Additionally, we cannot use ",
      ),
      html.code([], [html.text("next/image")]),
      html.text(
        " as this also requires some minimal runtime JavaScript (a regular ",
      ),
      html.code([], [html.text("img")]),
      html.text(
        " works just fine). This also means zero state updates or literally any JavaScript that would've otherwise been bundled can run.",
      ),
    ]),
    html.p([], [
      html.text(
        "So if you're fine with that, then you can go ahead and enable it. No more worrying about worrying about installing huge npm packages and watching your user count drop in realtime. See your gorgeous website in pure static HTML & CSS. Gone are the days of bundlephobia.com... I bet at this point you are itching to know how to enable it. Well, here's a quick example:",
      ),
    ]),
    code.block(
      "import type {PageConfig} from 'next';

export const config: PageConfig = {
	unstable_runtimeJS: false,
};

export default function IndexPage() {
	return <h1>This page has no JavaScript!</h1>;
}",
      code.TypeScript,
      [],
    ),
    html.p([], [
      html.text(
        "And boom! just like that, 0kb bundle. If you are going to use this though, just bear in mind that as well as the trade offs mentioned above, you literally cannot use any JavaScript in the client anymore for this page. Zero. Nada. Null. Void. That means no state updates, no network requests, no useEffect, no event listeners, no timers. Nothing.",
      ),
    ]),
  ])
}
