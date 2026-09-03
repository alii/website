import attribute as a
import blog/post.{type Post, Post}
import gleam/option.{Some}
import html
import react.{type Element}
import site/code
import site/date
import site/external_link
import site/note

pub fn post() -> Post {
  Post(
    name: "ESM",
    slug: "esm",
    date: date.utc(2023, 4, 3),
    hidden: True,
    excerpt: "Explaining ESM the easy way because I learnt it the hard way",
    keywords: ["module resolution", "esm", "cjs", "typescript", "javascript"],
    body: body,
  )
}

fn body() -> Element {
  react.fragment([
    html.p([], [
      html.text(
        "Module resolution in JavaScript is an extremely difficult topic.",
      ),
    ]),
    html.p([], [
      html.text("Early 2023 I"),
      html.text(" "),
      external_link.link(
        [a.href("https://twitter.com/alistaiir/status/1634274673876783120")],
        [html.text("posted a screenshot of a package.json")],
      ),
      html.text(" "),
      html.text("on Twitter. I captioned it \"It is "),
      html.i([], [html.text("crazy")]),
      html.text(
        " how ALL of this is needed to just publish a package in today's JS ecosystem…\"",
      ),
    ]),
    html.p([], [html.text("Andrew Branch replied.")]),
    html.p([], [
      external_link.link([a.href("https://twitter.com/atcb")], [
        html.text("Andrew"),
      ]),
      html.text(
        " works on TypeScript at Microsoft, on modules and auto-imports specifically. It's rumoured you can whisper \"module resolution\" three times in a mirror and he will appear. He was on holiday and yet replied anyway, with",
      ),
      html.text(" "),
      external_link.link(
        [a.href("https://twitter.com/atcb/status/1634653474041503744")],
        [html.text("an extremely detailed thread")],
      ),
      html.text(" "),
      html.text(
        "explaining how module resolution can/should really work. It turns out my tweet was actually quite wrong and was based on many misconceptions. I think what I posted was roughly the understanding of most of the folks from the JavaScript library/framework community, so it wasn't me with my understanding off, it was the industry being misaligned.",
      ),
    ]),
    html.p([], [
      html.text("Anyway, here's the contents of the package.json I posted:"),
    ]),
    code.block(
      "{	
	\"type\": \"module\",
	\"main\": \"./dist/index.cjs\",
	\"module\": \"./dist/index.js\",
	\"types\": \"./dist/index.d.ts\",
	\"exports\": {
		\".\": {
			\"types\": \"./dist/index.d.ts\",
			\"import\": \"./dist/index.js\",
			\"require\": \"./dist/index.cjs\"
		},
		\"./package.json\": \"./package.json\"
	}
}",
      code.Json,
      [code.Filename("package.json")],
    ),
    html.p([], [
      html.text(
        "What Andrew pointered out seemed insignificant, and surprisingly was the thing I was actually most confident was correct. I had a single root ",
      ),
      html.code([], [html.text("types")]),
      html.text(" field, aiming one "),
      html.code([], [html.text(".d.ts")]),
      html.text(
        " at both the ESM and the CJS build. That's wrong. The reason it's wrong is the reason I wanted to write this article.",
      ),
    ]),
    html.p([], [
      html.text(
        "That package.json is trying to be two packages at once: an ESM one and a CommonJS one, shipped under a single name. People call this a dual package, and the failure mode has a name too — the ",
      ),
      html.em([], [html.text("dual package hazard")]),
      html.text(
        ". If a consumer ever loads both your builds in the same process (easy, once some dependency-of-a-dependency pulls in the",
      ),
      html.text(" "),
      html.code([], [html.text("require")]),
      html.text(" version while your app pulls in the "),
      html.code([], [html.text("import")]),
      html.text(
        " one) they end up with two separate copies of your module. Two sets of private state.",
      ),
      html.text(" "),
      html.code([], [html.text("instanceof")]),
      html.text(
        " stops working across the seam, your singleton isn't single, and nobody can work out why. That's the swamp this little file is wading into.",
      ),
    ]),
    html.p([], [
      html.text(
        "Andrew's first reply didn't go near any of that. He zeroed in on the one field I'd have bet money on: the root ",
      ),
      html.code([], [html.text("types")]),
      html.text(". One "),
      html.code([], [html.text(".d.ts")]),
      html.text(", he said, cannot describe both builds, because a "),
      html.code([], [html.text(".d.ts")]),
      html.text(" isn't only types — it carries a module"),
      html.text(" "),
      html.em([], [html.text("format")]),
      html.text(
        ". That sentence is the whole article. It took me an embarrassingly long time to feel why it was true, and the moment it clicked was the moment I admitted I didn't actually know what happens when I type ",
      ),
      html.code([], [html.text("import")]),
      html.text("."),
    ]),
    html.p([], [
      html.text(
        "Reading the thread back, my tweet was wrong in more ways than one. Roughly, in order of how wrong:",
      ),
    ]),
    html.ul([], [
      html.li([], [
        html.text("I thought all of it was "),
        html.em([], [html.text("required")]),
        html.text(". Most of it is legacy fallback for resolvers that predate "),
        html.code([], [html.text("exports")]),
        html.text("."),
      ]),
      html.li([], [
        html.text("I thought "),
        html.code([], [html.text("exports")]),
        html.text(
          " was a JavaScript feature. It's a Node.js feature that the other runtimes copied.",
        ),
      ]),
      html.li([], [
        html.text("I thought a "),
        html.code([], [html.text(".d.ts")]),
        html.text(
          " was just types, the same in any context. It isn't — it has a format, ESM or CJS, baked in.",
        ),
      ]),
      html.li([], [
        html.text("I aimed one root "),
        html.code([], [html.text("types")]),
        html.text(
          " at both builds, which quietly tells every CommonJS consumer that my CJS build has a shape it doesn't have.",
        ),
      ]),
      html.li([], [
        html.text(
          "I blamed \"the ecosystem.\" The mess is real, but it lives in exactly one layer, and I was pointing at the whole stack.",
        ),
      ]),
    ]),
    html.p([], [
      html.text("To see why one "),
      html.code([], [html.text(".d.ts")]),
      html.text(" breaks, you need to know what "),
      html.code([], [html.text("exports")]),
      html.text(" "),
      html.text("actually is. To know what "),
      html.code([], [html.text("exports")]),
      html.text(
        " is, you have to answer a question I had somehow never asked, after years of writing imports every single day: when I type",
      ),
      html.text(" "),
      html.code([], [html.text("import x from 'y'")]),
      html.text(", what part of the system turns "),
      html.code([], [html.text("'y'")]),
      html.text(" into a file on disk?"),
    ]),
    html.p([], [
      html.text(
        "A reasonable answer to that question is \"Well... uhh... JavaScript does...\" The language. Some clause in the spec that knows where to look for your modules, perhaps that's",
      ),
      html.text(" "),
      html.code([], [html.text("node_modules")]),
      html.text(
        ". That guess is wrong, and the precise way it's wrong is the whole point.",
      ),
    ]),
    html.h3([], [html.text("The spec resolves nothing")]),
    html.p([], [
      external_link.link([a.href("https://tc39.es/ecma262/")], [
        html.text("ECMA-262"),
      ]),
      html.text(
        ", the actual specification, does not resolve modules. You cannot search for the part that turns",
      ),
      html.text(" "),
      html.code([], [html.text("'lodash'")]),
      html.text(" into a path. It isn't in there."),
    ]),
    html.p([], [
      html.text(
        "ECMA-262 contains the hard, abstract part. It models a module as a ",
      ),
      html.i([], [html.text("Module Record")]),
      html.text(","),
      html.text(" "),
      html.text(
        "and defines the lifecycle every module graph goes through: parse, link, evaluate. The ordering modules run in. How cycles get resolved. How top-level ",
      ),
      html.code([], [html.text("await")]),
      html.text(" "),
      html.text(
        "suspends a whole graph. What happens when something throws while the graph is still linking.",
      ),
    ]),
    html.p([], [
      html.text("\"What are "),
      html.i([], [html.text("parse")]),
      html.text(", "),
      html.i([], [html.text("link")]),
      html.text(", and "),
      html.i([], [html.text("evaluate")]),
      html.text("?\" I hear you ask..."),
    ]),
    html.p([], [
      html.text(
        "Two words first, gently, because the phases lean on them. The string you import — the",
      ),
      html.text(" "),
      html.code([], [html.text("'y'")]),
      html.text(" in "),
      html.code([], [html.text("import x from 'y'")]),
      html.text(" — is called a "),
      html.i([], [html.text("specifier")]),
      html.text(
        ", and it turns out to be the only thing the machinery gets to start from. And the thing that actually carries out the phases is the ",
      ),
      html.i([], [html.text("engine")]),
      html.text(
        "; for now just picture \"the program running your JavaScript,\" and trust that we'll pin down exactly what that means in a minute.",
      ),
    ]),
    html.p([], [
      html.text(
        "With those two in hand: every module goes through the same three phases, in order, exactly once.",
      ),
    ]),
    html.ul([], [
      html.li([], [
        html.strong([], [html.text("Parse.")]),
        html.text(" The engine reads the source text and turns it into a"),
        html.text(" "),
        html.i([], [html.text("Module Record")]),
        html.text(". Because "),
        html.code([], [html.text("import")]),
        html.text(" and "),
        html.code([], [html.text("export")]),
        html.text(
          " are syntax, not function calls, it learns the complete list of your imports and exports right here — by reading, without running a single line. This is the whole reason ESM can be statically analysed and CommonJS can't: ",
        ),
        html.code([], [html.text("require()")]),
        html.text(" is just a function, and it could be hiding behind an "),
        html.code([], [html.text("if")]),
        html.text("."),
      ]),
      html.li([], [
        html.strong([], [html.text("Link.")]),
        html.text(
          " The engine takes every specifier it found while parsing and resolves each one to another Module Record, recursively, until the whole graph exists. Then it wires up the bindings, so an imported name points at the ",
        ),
        html.em([], [html.text("live variable")]),
        html.text(" "),
        html.text(
          "in the module that exported it, not a copy. Still nothing has run. This is also where import cycles get reconciled — ",
        ),
        html.code([], [html.text("a")]),
        html.text(" and "),
        html.code([], [html.text("b")]),
        html.text(
          " can import each other because the bindings are created before any code evaluates.",
        ),
      ]),
      html.li([], [
        html.strong([], [html.text("Evaluate.")]),
        html.text(
          " Now the engine runs each module body, in dependency order, once. Top-level ",
        ),
        html.code([], [html.text("await")]),
        html.text(
          " suspends the graph here. If something throws, the graph is already linked, so you get a half-",
        ),
        html.em([], [html.text("run")]),
        html.text(" module rather than a half-"),
        html.em([], [html.text("built")]),
        html.text(" one."),
      ]),
    ]),
    html.p([], [
      html.text("Notice where the file lookup lives. It's in "),
      html.strong([], [html.text("link")]),
      html.text(
        " — \"resolve each specifier to another Module Record.\" That is the step that has to turn ",
      ),
      html.code([], [html.text("'y'")]),
      html.text(
        " into a file. And it is the exact step the spec quietly refuses to do itself.",
      ),
    ]),
    html.p([], [
      html.text(
        "When the spec reaches that step and needs the module hiding behind the specifier, it does not go looking for it. It calls a host hook -",
      ),
      html.text(" "),
      html.code([], [html.text("HostLoadImportedModule")]),
      html.text(", or its older synchronous self,"),
      html.text(" "),
      html.code([], [html.text("HostResolveImportedModule")]),
      html.text(
        " - and stops there. \"Host\" is spec-speak for \"not me, ask whoever is running this.\" It nails down ",
      ),
      html.em([], [html.text("when")]),
      html.text(" a module is needed. It says nothing about "),
      html.em([], [html.text("which file")]),
      html.text(" that is."),
    ]),
    html.p([], [
      html.text(
        "Read that twice, because it's the load-bearing sentence of the whole post: the specification — the document everyone cites as the source of truth for JavaScript — gets to",
      ),
      html.text(" "),
      html.code([], [html.text("import x from 'y'")]),
      html.text(", needs the file behind "),
      html.code([], [html.text("'y'")]),
      html.text(", and"),
      html.text(" "),
      html.em([], [html.text("delegates")]),
      html.text(
        ". It has no opinion. The opinion lives one layer down, in whatever the spec keeps calling the host. Which leaves exactly one question, the one the spec spends its whole length dodging: who ",
      ),
      html.em([], [html.text("is")]),
      html.text(" the host? The rest of this post is just answering that."),
    ]),
    html.h3([], [
      html.text("The engine runs it, and still doesn't do the lookup"),
    ]),
    html.p([], [
      html.text(
        "So the host is the engine, right? Not quite. V8 (and JavaScriptCore, and SpiderMonkey) is what implements parse/link/evaluate. It builds the records, walks the graph, runs the bytecode, keeps the order the spec asked for. The engine owns the timing.",
      ),
    ]),
    html.p([], [
      html.text(
        "It's worth knowing that not all specifiers are equal, because the runtime branches on exactly this. A ",
      ),
      html.em([], [html.text("relative")]),
      html.text(" specifier ("),
      html.code([], [html.text("'./util'")]),
      html.text(", "),
      html.code([], [html.text("'../lib/x'")]),
      html.text(") is resolved against the file doing the importing. An "),
      html.em([], [html.text("absolute")]),
      html.text(" one — a full path, or a "),
      html.code([], [html.text("file:")]),
      html.text("/"),
      html.code([], [html.text("https:")]),
      html.text(" URL in a browser — is taken as-is. And a"),
      html.text(" "),
      html.em([], [html.text("bare")]),
      html.text(" specifier ("),
      html.code([], [html.text("'lodash'")]),
      html.text(", "),
      html.code([], [html.text("'react'")]),
      html.text(
        ", no dot and no slash to anchor it) is the hard one: it names a ",
      ),
      html.em([], [html.text("package")]),
      html.text(
        ", not a location, and turning a package name into a file on disk is where the entire mess we're untangling actually lives.",
      ),
    ]),
    html.p([], [
      html.text("But V8 has no concept of a "),
      html.code([], [html.text("node_modules")]),
      html.text(
        " folder. It has never opened a package.json and it never will. It pushes resolution back out to whoever embedded it: you hand ",
      ),
      html.code([], [html.text("Module::InstantiateModule")]),
      html.text(
        " a resolve callback, and V8 calls that callback every time it has to turn a specifier into a module. The engine does the graph. You do the lookup.",
      ),
    ]),
    html.h3([], [
      html.text("The runtime is the only part that knows about files"),
    ]),
    html.p([], [
      html.text(
        "That embedder - the thing on the other end of the callback, answering \"what file is",
      ),
      html.text(" "),
      html.code([], [html.text("'y'")]),
      html.text("\" - is the runtime, and it's the "),
      html.em([], [html.text("host")]),
      html.text(
        " the spec kept pointing at the whole time. Well known runtimes are Bun, Node, Deno, and a browser, like the one you're reading this in now. Each one wraps an engine: Node embeds V8, Bun embeds JavaScriptCore, your browser embeds whichever engine ships with it. That's the boundary, finally drawn — the engine runs your code, and the runtime around it decides what your code even is: where",
      ),
      html.text(" "),
      html.code([], [html.text("'y'")]),
      html.text(" lives, whether "),
      html.code([], [html.text("node_modules")]),
      html.text(
        " is even a concept. Generally the surface most JavaScript engineers think of as \"how imports work\" lives here in the runtime, and the parse/link/evaluate lifecycle in the engine is sort of an opaque & unnecessary detail that we are lucky we don't need to worry about.",
      ),
    ]),
    html.p([], [
      html.text(
        "How does Bun or Node.js resolve my 1kb ai slop JavaScript library then?",
      ),
    ]),
    html.p([], [
      html.text(
        "Bun & Node.js (& more) implement Node.js' module resolution algorithm. This is not really defined in any spec, and has been known to change between Node.js majors. Roughly, for a bare specifier, it goes like this:",
      ),
    ]),
    html.ul([], [
      html.li([], [
        html.text("walk up the directory tree looking inside each "),
        html.code([], [html.text("node_modules")]),
        html.text(" until a folder matching the package name turns up"),
      ]),
      html.li([], [
        html.text("read that package's "),
        html.code([], [html.text("package.json")]),
      ]),
      html.li([], [
        html.text("if it has an "),
        html.code([], [html.text("exports")]),
        html.text(" field, "),
        html.em([], [html.text("that field decides everything")]),
        html.text(" — it's matched against the conditions in play ("),
        html.code([], [html.text("import")]),
        html.text(" vs "),
        html.code([], [html.text("require")]),
        html.text(","),
        html.text(" "),
        html.code([], [html.text("types")]),
        html.text(", "),
        html.code([], [html.text("node")]),
        html.text(", "),
        html.code([], [html.text("browser")]),
        html.text(", "),
        html.code([], [html.text("default")]),
        html.text(
          "), first match wins, and anything not listed is simply not reachable",
        ),
      ]),
      html.li([], [
        html.text("if there's no "),
        html.code([], [html.text("exports")]),
        html.text(", fall back to the old way: the "),
        html.code([], [html.text("main")]),
        html.text(" field, then guessing extensions ("),
        html.code([], [html.text(".js")]),
        html.text(", "),
        html.code([], [html.text(".mjs")]),
        html.text(", "),
        html.code([], [html.text(".cjs")]),
        html.text(") and"),
        html.text(" "),
        html.code([], [html.text("/index.js")]),
      ]),
      html.li([], [
        html.text("on the web there's no "),
        html.code([], [html.text("node_modules")]),
        html.text(
          " at all — specifiers resolve against a URL, and bare ones only work if an import map spells them out",
        ),
      ]),
    ]),
    note.note(note.Info, Some("exports is a door, not a hint"), [
      html.text("The thing that trips people up: when "),
      html.code([], [html.text("exports")]),
      html.text(" is present it doesn't "),
      html.em([], [html.text("add")]),
      html.text(" "),
      html.text("to the old extension-guessing, it "),
      html.em([], [html.text("replaces")]),
      html.text(
        " it. Files you don't list stop existing as far as the resolver is concerned, even when they're right there on disk. That's the feature — it's how a package finally gets to control its own public surface — but it's a sharp edge if you're used to reaching into ",
      ),
      html.code([], [html.text("some-pkg/lib/internal.js")]),
      html.text("."),
    ]),
    html.p([], [
      html.text(
        "And so, finally, this is the thing it took a wrong tweet to beat into me.",
      ),
      html.text(" "),
      html.code([], [html.text("exports")]),
      html.text(
        " is not a JavaScript feature. It's a Node.js feature. Node.js invented it, for Node.js' own resolver, and the other runtimes copied it... because what else were they going to do. So when people say \"ESM vs CJS is a mess,\" what they're really describing is one specific layer - the runtime's resolution layer - being a mess, because it's the only layer on the hook for keeping both worlds alive at the same time.",
      ),
    ]),
    html.h3([], [html.text("Why this took the whole industry a decade")]),
    html.p([], [
      html.text(
        "None of this was anyone being stupid. It was a contract the spec left blank on purpose, and a decade of every layer independently guessing at it.",
      ),
    ]),
    html.p([], [
      html.text(
        "ES2015 standardised modules, but only the half I described up top: the ",
      ),
      html.code([], [html.text("import")]),
      html.text("/"),
      html.code([], [html.text("export")]),
      html.text(
        " syntax and the parse/link/evaluate lifecycle. Resolution and loading were handed to the host deliberately, because a browser and a server fundamentally disagree about what a module even ",
      ),
      html.em([], [html.text("is")]),
      html.text(
        " — one fetches a URL over the network, the other reads a file off a disk. There was no single answer to standardise, so they standardised none.",
      ),
    ]),
    html.p([], [
      html.text(
        "Meanwhile Node had shipped CommonJS back in 2009, and npm had a seven-year, several-hundred-thousand-package head start. CommonJS is everything ESM isn't:",
      ),
      html.text(" "),
      html.code([], [html.text("require()")]),
      html.text(
        " is a plain synchronous function, resolved while the code runs, returning whatever object you assigned to ",
      ),
      html.code([], [html.text("module.exports")]),
      html.text(
        ". ESM is static, asynchronous, and live-bound. You cannot quietly alias one onto the other, and Node couldn't break the millions of packages that already existed. So for years there simply was no agreed way to even load an ES module in Node — proposals shipped and were ripped out,",
      ),
      html.text(" "),
      html.code([], [html.text(".mjs")]),
      html.text(" fought "),
      html.code([], [html.text("\"type\": \"module\"")]),
      html.text(
        ", and unflagged ESM didn't really land until Node 12–13 around 2019.",
      ),
    ]),
    html.p([], [
      html.text(
        "Because the spec said nothing about resolution, Node had to invent the bridge itself — and that's where ",
      ),
      html.code([], [html.text("exports")]),
      html.text(
        " and conditions came from. Because Node invented it rather than a standards body, everyone else got to interpret it: webpack, esbuild, Vite, Jest and the rest each shipped their ",
      ),
      html.em([], [html.text("own")]),
      html.text(
        " resolver, so the same package could resolve one way in Node, another in Vite, and a third in your test runner. TypeScript then had to model all of them at once, which is the entire reason ",
      ),
      html.code([], [html.text("moduleResolution")]),
      html.text(" is a menu of modes instead of a single correct value."),
    ]),
    html.p([], [
      html.text(
        "Bun had the one advantage nobody in 2015 had: hindsight. It arrived after the dust settled and implemented Node's resolution and ",
      ),
      html.code([], [html.text("exports")]),
      html.text(
        " semantics from day one, treating CJS/ESM interop as a built-in feature rather than something bolted on a major version at a time. That's not Bun being smarter; it's Bun being ",
      ),
      html.em([], [html.text("late")]),
      html.text(", which here was a gift."),
    ]),
    html.h3([], [html.text("Back to me being wrong")]),
    html.p([], [
      html.text(
        "So how do I fix my Tweet? As a reminder, the problem was that we had a root types field, that TypeScript was resolving for both CJS and ESM formats.",
      ),
    ]),
    code.block(
      "{
	\"exports\": {
		\".\": {
			\"import\": {
				\"types\": \"./dist/index.d.ts\",
				\"default\": \"./dist/index.js\"
			},
			\"require\": {
				\"types\": \"./dist/index.d.cts\",
				\"default\": \"./dist/index.cjs\"
			}
		},
		\"./package.json\": \"./package.json\"
	}
}",
      code.Json,
      [],
    ),
    note.note(note.Warning, Some("Order matters"), [
      html.text("First match wins. So "),
      html.code([], [html.text("types")]),
      html.text(" goes first in each block and "),
      html.code([], [html.text("default")]),
      html.text(" "),
      html.text("goes last. Put "),
      html.code([], [html.text("import")]),
      html.text(" or "),
      html.code([], [html.text("require")]),
      html.text(" above "),
      html.code([], [html.text("types")]),
      html.text(" and the consumer resolves straight to the "),
      html.code([], [html.text(".js")]),
      html.text(", never reaches the types, and decides you shipped none."),
    ]),
    html.p([], [
      html.text(
        "This is the part that gets everyone, the docs included, and it's the part Andrew had to walk me through slowly. A ",
      ),
      html.code([], [html.text(".d.ts")]),
      html.text(" describes the contents of a module"),
      html.text(" "),
      html.em([], [html.text("and")]),
      html.text(" its format. An ESM "),
      html.code([], [html.text(".d.ts")]),
      html.text(" is describing a file with the"),
      html.text(" "),
      html.code([], [html.text("export")]),
      html.text(" or "),
      html.code([], [html.text("import")]),
      html.text(" keyword; a CJS "),
      html.code([], [html.text(".d.cts")]),
      html.text(" is describing one with "),
      html.code([], [html.text("module.exports")]),
      html.text(" or "),
      html.code([], [html.text("export =")]),
      html.text(
        ". These are different, incompatible things. Because our package.json says",
      ),
      html.text(" "),
      html.code([], [html.text("\"type\": \"module\"")]),
      html.text(", a bare "),
      html.code([], [html.text(".d.ts")]),
      html.text(" is read as ESM and a"),
      html.text(" "),
      html.code([], [html.text(".d.cts")]),
      html.text(" as CJS, exactly the way "),
      html.code([], [html.text(".js")]),
      html.text(" and "),
      html.code([], [html.text(".cjs")]),
      html.text(" split. So if you aim your "),
      html.code([], [html.text("require")]),
      html.text(" consumers at the ESM "),
      html.code([], [html.text(".d.ts")]),
      html.text(
        ", their compiler decides your CommonJS build has a default export that doesn't exist.",
      ),
    ]),
    html.p([], [
      html.text("The fix is one declaration file per format: a "),
      html.code([], [html.text(".d.ts")]),
      html.text(" that describes the ESM build and a "),
      html.code([], [html.text(".d.cts")]),
      html.text(
        " that describes the CJS one, each pointed at by its own condition. The dumb part is how you get the second file. You build the ",
      ),
      html.code([], [html.text(".d.ts")]),
      html.text(", copy it, rename the copy to "),
      html.code([], [html.text(".d.cts")]),
      html.text(", and point "),
      html.code([], [html.text("require")]),
      html.text(
        " at it. A near-identical copy with a different extension is, genuinely, the state of the art.",
      ),
    ]),
    html.p([], [
      html.text(
        "You'd hope TypeScript would do this step for you, and, politely, it won't. ",
      ),
      html.code([], [html.text("tsc")]),
      html.text(" "),
      html.text(
        "emits one declaration per source file, matching that file's format — there's no \"also emit a CommonJS copy\" flag. So the copy-and-rename ends up in a build script, or you hand the whole job to a bundler that special-cases it. For the thing TypeScript is otherwise extremely good at, it's a surprising gap.",
      ),
    ]),
    html.p([], [
      html.text(
        "TypeScript is running the runtime's resolver, statically, before anything executes. It has to. To type-check ",
      ),
      html.code([], [html.text("import x from 'y'")]),
      html.text(
        " it needs to know which file the runtime is going to choose, so it reimplements resolution at build time and guesses.",
      ),
      html.text(" "),
      html.code([], [html.text("moduleResolution")]),
      html.text(" is you telling it which runtime to imitate:"),
      html.text(" "),
      html.code([], [html.text("node16")]),
      html.text(" and "),
      html.code([], [html.text("nodenext")]),
      html.text(" copy Node's "),
      html.code([], [html.text("exports")]),
      html.text("-aware resolver, "),
      html.code([], [html.text("bundler")]),
      html.text(" copies what esbuild and Vite do, and the ancient"),
      html.text(" "),
      html.code([], [html.text("node10")]),
      html.text(" (just "),
      html.code([], [html.text("node")]),
      html.text(", renamed in TS 5.0) predates"),
      html.text(" "),
      html.code([], [html.text("exports")]),
      html.text(
        " entirely and ignores it — which, by the way, is the actual reason you still keep a root ",
      ),
      html.code([], [html.text("main")]),
      html.text(" and "),
      html.code([], [html.text("types")]),
      html.text(
        " around. They're the fallback for everything still resolving like it's 2019. And when TypeScript's guess and the real runtime disagree, your types are quietly wrong, and you don't find out. Someone else does.",
      ),
    ]),
    html.h3([], [html.text("Just use a tool")]),
    html.p([], [
      html.text(
        "Try to avoid doing this by eye - I strongly recommend you check out",
      ),
      html.text(" "),
      external_link.link([a.href("https://arethetypeswrong.github.io/")], [
        html.text("Are the types wrong (ATTW)"),
      ]),
      html.text(
        ". It's a project from Andrew, naturally. ATTW runs your package through every resolution mode supported in TypeScript, and tells you exactly which consumers break and why. And for actually producing the dual build, let",
      ),
      html.text(" "),
      external_link.link([a.href("https://github.com/isaacs/tshy")], [
        html.text("tshy"),
      ]),
      html.text(","),
      html.text(" "),
      external_link.link([a.href("https://tsup.egoist.dev/")], [
        html.text("tsup"),
      ]),
      html.text(", or these days just"),
      html.text(" "),
      external_link.link([a.href("https://bun.com")], [html.text("Bun")]),
      html.text(" emit the "),
      html.code([], [html.text(".js")]),
      html.text("/"),
      html.code([], [html.text(".cjs")]),
      html.text(" pair, the matching declarations, and the "),
      html.code([], [html.text("exports")]),
      html.text(" block."),
    ]),
    html.h3([], [html.text("tl;dr")]),
    html.ul([], [
      html.li([], [
        html.text(
          "the spec owns timing and treats specifiers as opaque strings",
        ),
      ]),
      html.li([], [
        html.text(
          "the engine runs the spec and asks a callback to do the lookup",
        ),
      ]),
      html.li([], [
        html.text("the runtime does the lookup — "),
        html.code([], [html.text("node_modules")]),
        html.text(", package.json,"),
        html.text(" "),
        html.code([], [html.text("exports")]),
        html.text(". "),
        html.code([], [html.text("exports")]),
        html.text(" is Node's, not the language's"),
      ]),
      html.li([], [
        html.text("TypeScript reimplements the runtime's resolver statically; "),
        html.code([], [html.text("moduleResolution")]),
        html.text(" "),
        html.text("picks which one to copy"),
      ]),
      html.li([], [
        html.text("inside "),
        html.code([], [html.text("exports")]),
        html.text(": first match wins, "),
        html.code([], [html.text("types")]),
        html.text(" first,"),
        html.text(" "),
        html.code([], [html.text("default")]),
        html.text(" last, ship "),
        html.code([], [html.text(".d.ts")]),
        html.text(" + "),
        html.code([], [html.text(".d.cts")]),
        html.text(", run"),
        html.text(" "),
        html.code([], [html.text("attw")]),
      ]),
    ]),
    html.p([], [
      html.text(
        "The fix was never a better package.json. It was finally getting that the runtime owns the lookup and the language washed its hands of it years ago. Everything weird about",
      ),
      html.text(" "),
      html.code([], [html.text("exports")]),
      html.text(
        " I'd been copy-pasting on faith had a reason the whole time. I just hadn't asked who was answering the question.",
      ),
    ]),
    html.p([], [
      html.text(
        "This post was originally called \"WTF, ESM!?\" - which seemed appropriate at the time. I started writing this post over three years ago and in that time the industry very good coding agents. I don't know about you, but I'm not writing code anymore. These intricate details are less important for most/many engineers.",
      ),
    ]),
  ])
}
