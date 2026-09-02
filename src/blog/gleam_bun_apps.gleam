import attribute as a
import blog/post.{type Post, Post}
import html
import react.{type Element}
import site/code
import site/date
import site/external_link

pub fn post() -> Post {
  Post(
    name: "Single file apps with Gleam and Bun",
    slug: "gleam-bun-apps",
    date: date.utc(2026, 8, 21),
    hidden: False,
    excerpt: "Build single file executables in Gleam, bundled and run with Bun",
    keywords: ["gleam", "bun", "single file executables", "javascript"],
    body: body,
  )
}

fn body() -> Element {
  react.fragment([
    html.p([], [
      external_link.link([a.href("https://gleam.run/")], [html.text("Gleam")]),
      html.text(
        " is a friendly language primarily used for writing fault-tolerant and often distributed systems. It implements a Hindley-Milner type system, which is a type system that allows for maximum type-safety without sacrificing productivity. Most users of Gleam choose to run it in the BEAM, which is the same fantastic Virtual Machine that Elixir and Erlang run in. Basically, Gleam is really very good.",
      ),
    ]),
    html.p([], [
      external_link.link([a.href("https://bun.com")], [html.text("Bun")]),
      html.text(", which I work on, has support for"),
      html.text(" "),
      external_link.link([a.href("https://bun.com/docs/bundler/executables")], [
        html.text("Single File Executables"),
      ]),
      html.text(
        ". This feature of Bun's bundler enables bundling your code with the runtime itself, into a single binary as output. These binaries are completely standalone and do not require your end user to have any extra packages installed on their system. They can be cross-compiled and you can target both glibc and musl on Linux. Basically, Bun single file executables are really very good.",
      ),
    ]),
    html.p([], [
      html.text("So how can we combine these two really very good things?"),
    ]),
    html.h2([], [html.text("Writing our program")]),
    html.p([], [
      html.text(
        "Conveniently, Gleam has a JavaScript backend. That means that, as well as targeting the BEAM, Gleam can also output JavaScript. Frameworks like",
      ),
      html.text(" "),
      external_link.link([a.href("https://github.com/lustre-labs/lustre")], [
        html.text("Lustre"),
      ]),
      html.text(
        " use this to let you write full-stack apps with Gleam that run in browsers, while libraries like",
      ),
      html.text(" "),
      external_link.link([a.href("https://gossamer.hexdocs.pm/")], [
        html.text("gossamer"),
      ]),
      html.text(
        " provide idiomatic Gleam bindings to JavaScript APIs that exist in our runtime(s) such as",
      ),
      html.text(" "),
      html.code([], [html.text("fetch()")]),
      html.text(", "),
      html.code([], [html.text("crypto")]),
      html.text(", "),
      html.code([], [html.text("Worker")]),
      html.text(", "),
      html.code([], [html.text("URL")]),
      html.text(", etc."),
    ]),
    html.p([], [
      html.text(
        "So, if we want to use Bun's single file executable feature but author our program in Gleam, it is precisely writing idiomatic Gleam bindings for APIs that exist in our JavaScript runtime that we are interested in.",
      ),
    ]),
    html.p([], [
      html.text(
        "Here's a quick and dirty example that exposes two of Bun's APIs to Gleam:",
      ),
    ]),
    code.block(
      "// Bun.file(path).text() -> Promise<string>
export function readText(path) {
	return Bun.file(path).text();
}

// Bun.semver.satisfies(version, range) -> boolean
export function semverSatisfies(version, range) {
	return Bun.semver.satisfies(version, range);
}",
      code.JavaScript,
      [code.Filename("src/bun_ffi.mjs")],
    ),
    code.block(
      "import gleam/io
import gleam/javascript/promise.{type Promise}

@external(javascript, \"./bun_ffi.mjs\", \"readText\")
fn read_text(path: String) -> Promise(String)

@external(javascript, \"./bun_ffi.mjs\", \"semverSatisfies\")
fn semver_satisfies(version: String, range: String) -> Bool

pub fn main() {
	use version <- promise.map(read_text(\"./VERSION\"))
	case semver_satisfies(version, \"^2.0.0\") {
		True -> io.println(\"v\" <> version <> \" is compatible\")
		False -> io.println(\"v\" <> version <> \" needs migrating\")
	}
}",
      code.Gleam,
      [code.Filename("src/app.gleam")],
    ),
    html.p([], [
      html.text(
        "Don't worry if you are unfamiliar with the Gleam code above. The most important lines are those with",
      ),
      html.text(" "),
      external_link.link(
        [
          a.href(
            "https://gleam.run/documentation/externals/#JavaScript-externals",
          ),
        ],
        [html.code([], [html.text("@external")])],
      ),
      html.text(" "),
      html.text(
        "attributes. This is syntax for telling the Gleam compiler that X function will exist at runtime, accepting Y arguments, returning Z value, but the implementation lives",
      ),
      html.text(" "),
      html.i([], [html.text("somewhere else")]),
      html.text(
        ". These types are not checked, so it's on the developer to make sure they are correct. In our case, the implementation lives in a separate JavaScript file on the disk, which relative to the Gleam file is ",
      ),
      html.code([], [html.text("./bun_ffi.mjs")]),
      html.text("."),
    ]),
    html.p([], [
      html.text(
        "We can run this code with the Gleam CLI itself, with two extra flags.",
      ),
    ]),
    code.shell(
      "gleam run --target=javascript --runtime=bun
Downloading packages
 Downloaded 2 packages in 0.01s
  Compiling gleam_stdlib
  Compiling gleam_javascript
  Compiling app
   Compiled in 0.03s
    Running app.main
v2.1.0 is compatible",
      dollar_on_first_line_only: True,
    ),
    html.p([], [
      html.text(
        "Nice! We just called some Bun APIs from our Gleam code, and even dealt with promises in the process! This is great, but there are two problems:",
      ),
    ]),
    html.p([], [html.text("To run our program...")]),
    html.ol([], [
      html.li([], [html.text("...we need both Gleam and Bun installed...")]),
      html.li([], [html.text("...and we need the original source code.")]),
    ]),
    html.p([], [
      html.text(
        "This, of course, is a very unfriendly user experience and makes it virtually impossible to distribute our application in any way that a normal user (or even developer) would expect.",
      ),
    ]),
    html.h2([], [html.text("Building our program")]),
    html.p([], [
      html.text("We've been using "),
      html.code([], [html.text("gleam run")]),
      html.text(
        ", which is fine while we're exploring, but it's strange to run our app just to generate build artifacts. Instead, Gleam provides us with a",
      ),
      html.text(" "),
      html.code([], [html.text("gleam build")]),
      html.text(" command."),
    ]),
    code.shell(
      "gleam build --target=javascript
   Compiled in 0.00s",
      dollar_on_first_line_only: True,
    ),
    html.p([], [
      html.text("Note that "),
      html.code([], [html.text("--runtime=bun")]),
      html.text(" is gone, since it's a "),
      html.code([], [html.text("gleam run")]),
      html.text(
        " flag only. It only ever told Gleam which runtime it should shell out to, and the JavaScript it emits is identical anyway.",
      ),
    ]),
    html.p([], [
      html.text("Gleam just created a "),
      html.code([], [html.text("build/dev/javascript/")]),
      html.text(
        " directory. The contents are nothing exotic - it's simply JavaScript. In fact, Gleam's JavaScript backend generates extremely human-readable and modern JavaScript, even using ECMAScript Modules (ESM). This is great!",
      ),
    ]),
    html.p([], [
      html.text("Our "),
      html.code([], [html.text("src/app.gleam")]),
      html.text(" compiled to "),
      html.code([], [html.text("build/[..]/app.mjs")]),
      html.text(", which exports our "),
      html.code([], [html.text("main")]),
      html.text(
        " function but doesn't call it. So, we can write a small entrypoint that does:",
      ),
    ]),
    code.block(
      "import {main} from \"./build/dev/javascript/app/app.mjs\";
main();",
      code.JavaScript,
      [code.Filename("entry.mjs")],
    ),
    html.p([], [html.text("Which we can run with Bun, directly:")]),
    code.shell(
      "bun entry.mjs
v2.1.0 is compatible",
      dollar_on_first_line_only: True,
    ),
    html.p([], [html.text("It works! Amazing.")]),
    html.p([], [
      html.text(
        "So... instead of running that entrypoint directly, what if we hand it to Bun's bundler and ask for a binary?",
      ),
    ]),
    code.shell(
      "bun build --compile entry.mjs --outfile dist/app
   [4ms]  bundle  23 modules
  [58ms] compile  dist/app",
      dollar_on_first_line_only: True,
    ),
    html.p([], [
      html.text("That command generates a "),
      html.code([], [html.text("dist/app")]),
      html.text(
        " single file executable. You can copy it onto a machine without Gleam or Bun installed, and without any of the source code, and it will still run just fine. It's entirely self-contained and standalone. Both of the problems we had earlier are gone. We have made our Gleam program much easier to distribute!",
      ),
    ]),
    html.p([], [
      html.text("Recall that our "),
      html.code([], [html.text("@external")]),
      html.text(" attributes pointed at "),
      html.code([], [html.text("./bun_ffi.mjs")]),
      html.text(
        ", relative to the Gleam file. When Gleam compiled our program, it copied that file into",
      ),
      html.text(" "),
      html.code([], [html.text("build/dev/javascript/app/")]),
      html.text(", right next to the "),
      html.code([], [html.text("app.mjs")]),
      html.text(
        " it generated. The relative import still resolves, so Bun's bundler just follows it the same way it would follow any import in any other project. Bun sees ECMAScript Modules with a relative import, and bundles them, and it has no idea that Gleam was even involved at any point!",
      ),
    ]),
    html.p([], [
      html.text(
        "And because that output is an ordinary Bun executable, the rest of the bundler is still available to us. We can cross-compile from a Mac straight to a Linux ELF:",
      ),
    ]),
    code.shell(
      "bun build --compile --target=bun-linux-x64 entry.mjs --outfile dist/app-linux
   [4ms]  bundle  23 modules
  [58ms] compile  dist/app-linux bun-linux-x64-v1.4.0",
      dollar_on_first_line_only: True,
    ),
    html.p([], [
      html.text(
        "There are targets for Linux, macOS and Windows, on both x64 and arm64, and on Linux you can pick glibc or musl. If it hasn't already, Bun will download the runtime for whichever target you asked for, so the first cross-compile is slightly slower than the rest.",
      ),
    ]),
    html.p([], [
      html.text(
        "That's it - only two commands - a Gleam build and then a Bun build. This also works in a fresh checkout because Gleam will install missing dependencies during",
      ),
      html.text(" "),
      html.code([], [html.text("gleam build")]),
      html.text("."),
    ]),
    html.p([], [
      html.text(
        "I'll soon write a Part II post about how we can take this a step further, and write desktop apps with Gleam. In short, you could probably imagine what using Gleam's JavaScript target with bindings to frameworks like Electron might look like.",
      ),
    ]),
    html.p([], [html.text("Happy shipping.")]),
    html.br([]),
    html.div([a.class("text-xs")], [
      html.p([], [
        html.text("Thank you to "),
        external_link.link([a.href("https://x.com/landon_xyz")], [
          html.text("Landon Boles"),
        ]),
        html.text(" "),
        html.text("who helped me with a draft of this post."),
      ]),
    ]),
  ])
}
