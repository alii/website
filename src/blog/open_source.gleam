import attribute as a
import blog/post.{type Post, Post}
import html
import react.{type Element}
import site/date

pub fn post() -> Post {
  Post(
    name: "Open Source",
    slug: "open-source",
    date: date.utc(2022, 3, 20),
    hidden: True,
    excerpt: "Thoughts & feelings on Open Source",
    keywords: [
      "open source",
      "sustainability",
      "github sponsors",
      "maintainership",
    ],
    body: body,
  )
}

fn body() -> Element {
  react.fragment([
    html.p([], [
      html.small([], [
        html.text("Relevant xkcd: "),
        html.a([a.href("https://xkcd.com/2347/")], [html.text("#2347")]),
      ]),
    ]),
    html.p([], [
      html.text(
        "I really do love open source. I love being able to build software that I know people will be able to make great use of. I love that we can extend already existing open source software & I love that we're able to put licenses on our code and explain where and how you can use it.",
      ),
    ]),
    html.p([], [
      html.text(
        "But open source is a truly double-edged sword. There are always stories on Twitter with people explaining how they were taken advantage of, or don't have the resources to keep maintaining a project.",
      ),
    ]),
    html.p([], [
      html.text("Recently, a library called "),
      html.code([], [html.text("faker.js")]),
      html.text(
        " was nuked by the author in an attempt to make a \"political\" point. Wildly unsuccessful and, in my opinion, extremely immature. However, the community responded really quickly and quickly forked the project into",
      ),
      html.text(" "),
      html.code([], [html.text("@faker-js/faker")]),
      html.text(
        ". This meant developers could easily switch their project over to use a 100% API compatible, up-to-date and community-managed version of the project. The original author, Marak Squires, ended up deleting the original repo. As well as that, Squires also placed malicious code in another project of his, ",
      ),
      html.code([], [html.text("colors.js")]),
      html.text(", that would infinite loop the victim's computer."),
    ]),
    html.p([], [
      html.text(
        "But there was a reason for this. Thanks to the wonderful archive.org, we're able to see old and deleted posts explaining why this had happened — and it's a common frustration within the community. Famously, Marak mentions he will do",
      ),
      html.text(" "),
      html.a(
        [
          a.href(
            "http://web.archive.org/web/20210704022108/https:/github.com/Marak/faker.js/issues/1046",
          ),
        ],
        [html.text("No more free work")],
      ),
      html.text(" "),
      html.text("and he's also written a good"),
      html.text(" "),
      html.a(
        [
          a.href(
            "https://web.archive.org/web/20210516172305/https:/marak.com/blog/2021-04-25-monetizing-open-source-is-problematic",
          ),
        ],
        [html.text("few hundred words")],
      ),
      html.text(" "),
      html.text("on the topic, too."),
    ]),
    html.p([], [
      html.text(
        "Okay, so he's frustrated with people taking Open Source for granted. What's the solution here? Well, fantastic companies like OpenCollective and GitHub are taking the initiative to provide a direct, low-fee method of sponsoring open source projects. Big companies like Discord, Stripe, and Microsoft have all sponsored small and large projects and sometimes they get their name on the README in return. At the moment, we're not quite there completely, but we're definitely heading in the right direction.",
      ),
    ]),
    html.p([], [
      html.text("Alternatively, a recent JavaScript library popped up called "),
      html.code([], [html.text("motion")]),
      html.text(" ("),
      html.a([a.href("https://motion.dev/")], [html.text("motion.dev")]),
      html.text(
        ") which caused a bit of a stir in the community for shaking things up a little bit with regards to their monetization strategy. The library itself exists on npm and can be installed as you would any other node module, except there is no GitHub URL for the package..? Taking a look at the README on npm says the following:",
      ),
    ]),
    html.blockquote([], [
      html.text(
        "Become a sponsor and get access to the private Motion One repo. File issues, read the changelog and source code, and join discussions that help shape the future of the API.",
      ),
    ]),
    html.p([], [
      html.text(
        "Okay, interesting, so you can use the module and read the documentation for free, but accessing the source code requires somewhat of a paid subscription. There is valid incentive for companies to do this as it allows them to not only audit the codebase (under security concerns), but also it allows for reading the source code to see how everything works and learn a lot.",
      ),
    ]),
    html.p([], [
      html.text("So what's the downside to this? Well, one of the reasons "),
      html.b([], [html.text("traditional")]),
      html.text(
        " open source is brilliant is because it allows anybody to freely see how something works — so assuming that is true, could we even call ",
      ),
      html.code([], [html.text("motion")]),
      html.text(
        " an open source project? What's more, a lot of individual developers are students or kids learning and as such, they're not financially able to support projects. On top of that, they are the generation we want to be educating the MOST about programming and so immediately cutting them off is definitely not a win.",
      ),
    ]),
    html.p([], [
      html.text(
        "One final example of open source being painful has got to be Fastify. Fastify's creator is active on Twitter very often and there have been a few Tweets describing some headaches they have had to go through as a team to get Fastify to be successful. Keeping it short, but one thing they have done extensively has been advertising Fastify, which has kept it mainstream and allowed for more users and therefore sponsorships. Matteo Collina, Fastify's creator, has explained that had there not been the advertising done, Fastify would not be as maintained, if at all, as it is today. Right now, Fastify has two core maintainers and 16 on the core team overall.",
      ),
    ]),
    html.p([], [
      html.text(
        "There is plenty of room for innovation in this space. I'm excited to see where GitHub sponsors and OpenCollective go and if we can see some large tech companies spreading the word about open source.",
      ),
    ]),
    html.p([], [
      html.text(
        "By the way, I do accept sponsorships via GitHub, so if you enjoy my work or writing then please consider any spare VC funding you have just raised 😊",
      ),
      html.text(" "),
      html.a([a.href("https://github.com/sponsors/alii")], [
        html.text("github.com/sponsors/alii"),
      ]),
    ]),
    html.p([], [html.text("Thanks for reading!")]),
  ])
}
