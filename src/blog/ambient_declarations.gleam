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
    name: "Ambient Declarations",
    slug: "ambient-declarations",
    date: date.utc(2025, 5, 9),
    hidden: False,
    excerpt: "Explaining ambient declarations with @types/bun as an example",
    keywords: [
      "typescript",
      "module resolution",
      "ambient declarations",
      "declaration files",
    ],
    body: body,
  )
}

fn body() -> Element {
  react.fragment([
    html.p([], [
      html.text("I recently landed a pull request ("),
      html.a([a.href("https://github.com/oven-sh/bun/pull/18024")], [
        html.text("#18024"),
      ]),
      html.text(") in"),
      html.text(" "),
      html.a([a.href("https://bun.com/")], [html.text("Bun")]),
      html.text(
        " that reorganized and rewrote significant portions of Bun's TypeScript definitions. Working on this PR made me realize how little documentation there is on ambient declarations, so I wanted to write about it.",
      ),
    ]),
    html.h2([], [html.text("What are ambient declarations?")]),
    html.p([], [
      html.text(
        "I'll start by answering this question with a couple questions...",
      ),
    ]),
    html.blockquote([], [
      html.text("1. How does TypeScript know the types of my "),
      html.code([], [html.text("node_modules")]),
      html.text(", which are mostly all .js files?"),
    ]),
    html.blockquote([], [
      html.text(
        "2. How does TypeScript know the types of APIs that exist in my runtime?",
      ),
    ]),
    html.p([], [
      html.text("The short answer: "),
      html.b([], [html.text("It can't!")]),
    ]),
    html.p([], [
      html.text("The short but slightly longer answer is that it "),
      html.i([], [html.text("CAN")]),
      html.text(
        " with some extra files - ambient declarations! These are files that exist somewhere in your project (usually in",
      ),
      html.text(" "),
      html.code([], [html.text("node_modules")]),
      html.text(") that contain type information and tell TypeScript what"),
      html.text(" "),
      html.i([], [html.text("things")]),
      html.text(" exist at runtime. They use the file extension "),
      html.code([], [html.text(".d.ts")]),
      html.text(", with the `.d` denoting \"declaration\"."),
    ]),
    html.p([], [
      html.text("By "),
      html.i([], [html.text("things")]),
      html.text(
        " I mean anything you import and use. That could be functions, classes, variables, modules themselves, APIs from your runtime, etc.",
      ),
    ]),
    html.p([], [
      html.text(
        "They're called \"ambient\" declarations because in the TypeScript universe ambient simply means \"without implementation\"",
      ),
    ]),
    html.p([], [
      html.text(
        "If you've ever imported a package and magically got autocomplete and type checking, you've benefited from ambient declarations.",
      ),
    ]),
    html.p([], [
      html.text("A simple ambient declaration file could look like this:"),
    ]),
    code.block(
      "/**
 * Performs addition using AI and LLMs
 *
 * @param a - The first number
 * @param b - The second number
 *
 * @returns The sum of a and b (probably)
 */
export declare function add(a: number, b: number): Promise<number>;",
      code.TypeScript,
      [code.Filename("add.d.ts")],
    ),
    html.p([], [
      html.text(
        "If you can already read TypeScript this ambient declaration will be very easy to understand. You can clearly see a JSDoc comment, the types of the arguments, the return type, an export keyword, etc. It almost looks like real TypeScript, except the really important part to note here is the keyword ",
      ),
      html.code([], [html.text("declare")]),
      html.text(
        " is used. This keyword tells TypeScript to not expect any runtime code to exist here, it's purely a type declaration only.",
      ),
    ]),
    note.note(note.Info, Some("Using the declare keyword in source code"), [
      html.text("It's completely legitimate and legal to use the "),
      html.code([], [html.text("declare")]),
      html.text(
        " keyword inside of regular .ts files. There are many use cases for this, a common one being declaring types of globals.",
      ),
    ]),
    html.h2([], [html.text("Ambient vs. Regular Declarations")]),
    html.p([], [
      html.b([], [html.text("Regular declarations")]),
      html.text(" are for code you write and control."),
    ]),
    code.block(
      "export function add(a: number, b: number): number {
	return a + b;
}",
      code.TypeScript,
      [code.Filename("add.ts")],
    ),
    html.p([], [
      html.b([], [html.text("Ambient declarations")]),
      html.text(" are for code that exists elsewhere."),
    ]),
    code.block(
      "export declare function add(a: number, b: number): number;",
      code.TypeScript,
      [code.Filename("add.d.ts")],
    ),
    html.h2([], [html.text("Compiler contract")]),
    html.p([], [
      html.text(
        "Since ambient modules don't contain runtime code, they should be treated like \"promises\" or \"contracts\" that you are making with the compiler. They're like documentation that TypeScript can understand. Just like documentation for humans, it can get out of sync with the actual runtime code. A lot of the work I'm doing at Bun is ensuring our type definitions are up to date with Bun's runtime APIs.",
      ),
    ]),
    html.hr([]),
    html.h2([], [html.text("How Does TypeScript Find Types?")]),
    html.p([], [
      html.text(
        "Module resolution is an incredibly complex topic, but it boils down to TypeScript looking for relevant types in a few places.",
      ),
    ]),
    html.ul([a.class("space-y-6")], [
      html.li([], [
        html.b([], [html.text("Bundled types")]),
        html.text(": Some packages include their own "),
        html.code([], [html.text(".d.ts")]),
        html.text(" files."),
      ]),
      html.li([], [
        html.b([], [html.text("DefinitelyTyped")]),
        html.text(": If not, TypeScript looks in "),
        html.code([], [html.text("@types/")]),
        html.text(" packages in"),
        html.text(" "),
        html.code([], [html.text("node_modules")]),
        html.text("."),
      ]),
      html.li([], [
        html.b([], [html.text("Your own project")]),
        html.text(": You can add "),
        html.code([], [html.text(".d.ts")]),
        html.text(
          " files anywhere in your project to describe types for JS code, global variables, or even new modules.",
        ),
      ]),
      html.li([], [
        html.b([], [html.text("Source")]),
        html.text(
          ": If the module resolution algorithm resolves to an actual TypeScript file, then the types can be read from the original source code anyway. Some packages on NPM also publish their TypeScript source and allow modern tooling to consume it directly.",
        ),
        html.text(" "),
        html.b([], [
          html.u([], [
            html.text(
              "Ambient declarations are NOT used in either of these scenarios",
            ),
          ]),
        ]),
        html.text("."),
      ]),
    ]),
    html.h2([], [html.text("Module vs. Script Declarations")]),
    html.ul([], [
      html.li([], [
        html.b([], [html.text("Module declarations")]),
        html.text(": Any "),
        html.code([], [html.text(".d.ts")]),
        html.text(" file with a top-level"),
        html.text(" "),
        html.code([], [html.text("import")]),
        html.text(" or "),
        html.code([], [html.text("export")]),
        html.text(". Types are added to the module."),
      ]),
      html.li([], [
        html.b([], [html.text("Script (global) declarations")]),
        html.text(
          ": No top-level import/export. Types are added to the global scope.",
        ),
      ]),
    ]),
    html.table([], [
      html.thead([], [
        html.tr([], [
          html.th([], [html.text("File Type")]),
          html.th([], [html.text("Example Syntax")]),
          html.th([], [html.text("Scope")]),
        ]),
      ]),
      html.tbody([], [
        html.tr([], [
          html.td([], [html.text("Module")]),
          html.td([], [
            html.code([], [html.text("export declare function foo(): void;")]),
          ]),
          html.td([], [html.text("Module only (must be imported)")]),
        ]),
        html.tr([], [
          html.td([], [html.text("Script (global)")]),
          html.td([], [
            html.code([], [
              html.text("declare function setTimeout(...): number;"),
            ]),
            html.br([]),
            html.code([], [html.text("declare function foo(): void;")]),
          ]),
          html.td([], [html.text("Global (available everywhere)")]),
        ]),
      ]),
    ]),
    html.p([], [
      html.b([], [html.text("Rule of thumb:")]),
      html.text(
        " An ambient declaration file is global unless it has a top-level import/export.",
      ),
    ]),
    note.note(note.Warning, Some("Global pollution"), [
      html.text(
        "Script files can pollute the global namespace and can very easily",
      ),
      html.text(" "),
      html.a([a.href("https://github.com/oven-sh/bun/issues/8761")], [
        html.text("clash with other declarations"),
      ]),
      html.text(". Prefer the module pattern unless you "),
      html.i([], [html.text("really")]),
      html.text(" need to patch "),
      html.code([], [html.text("globalThis")]),
      html.text("."),
    ]),
    html.p([], [
      html.text(
        "Why does this distinction exist? TypeScript is old in JavaScript's history - it predates the modern module system (ESM) and needed to support the \"everything is global\" style of early JS. That's why it still supports both module and script (global) declaration files.",
      ),
    ]),
    html.p([], [
      html.b([], [html.text("How does TypeScript treat these differently?")]),
    ]),
    html.ul([], [
      html.li([], [
        html.b([], [html.text("Module:")]),
        html.text(
          " Everything you declare is private to that module and must be explicitly imported by the consumer - just like regular TypeScript/ESM code.",
        ),
      ]),
      html.li([], [
        html.b([], [html.text("Script (global):")]),
        html.text(
          " Everything is injected directly into the global scope of every file in your program. This is how the DOM lib ships types like ",
        ),
        html.code([], [html.text("window")]),
        html.text(","),
        html.text(" "),
        html.code([], [html.text("document")]),
        html.text(", and functions like "),
        html.code([], [html.text("setTimeout")]),
        html.text("."),
      ]),
    ]),
    html.p([], [html.b([], [html.text("When would you use each?")])]),
    html.ul([], [
      html.li([], [
        html.b([], [html.text("Module:")]),
        html.text(" For packages, libraries, and almost all modern code."),
      ]),
      html.li([], [
        html.b([], [html.text("Script:")]),
        html.text(
          " For patching browser globals, legacy code, or when you really need to add something to the global scope.",
        ),
      ]),
    ]),
    note.note(note.Info, Some("Augmenting the global scope from a module"), [
      html.text(
        "You can still augment the global scope from inside a module-style declaration file by using the ",
      ),
      html.code([], [html.text("global "), html.text("{ ... }")]),
      html.text(
        " escape hatch, but that should be reserved for unavoidable edge-cases.",
      ),
    ]),
    html.h2([], [html.text("Declaring modules by name")]),
    html.p([], [
      html.text(
        "You can declare a module by its name. As long as the ambient declaration file gets referenced or included in your build somehow, then TypeScript will make the module available.",
      ),
    ]),
    code.block(
      "declare module 'my-legacy-lib' {
	export function doSomething(): void;
}",
      code.TypeScript,
      [code.Filename("my-legacy-lib.d.ts")],
    ),
    html.p([], [
      html.text(
        "This syntax also allows for declaring modules with wildcard matching. We do this in",
      ),
      html.text(" "),
      html.code([], [html.text("@types/bun")]),
      html.text(", since Bun allows for importing "),
      html.code([], [html.text(".toml")]),
      html.text(" and"),
      html.text(" "),
      html.code([], [html.text(".html")]),
      html.text(" files."),
    ]),
    code.block(
      "declare module '*.toml' {
	const content: unknown;
	export default content;
}
declare module '*.html' {
	const content: string;
	export default content;
}",
      code.TypeScript,
      [code.Filename("bun.d.ts")],
    ),
    html.h2([], [html.text("Writing Your Own .d.ts Files")]),
    html.p([], [
      html.text(
        "Suppose you're using a JS library with no types. Here's how to add them:",
      ),
    ]),
    html.ol([], [
      html.li([], [
        html.text("Create a new "),
        html.code([], [html.text(".d.ts")]),
        html.text(" file (you could put this in a "),
        html.code([], [html.text("types/")]),
        html.text(" "),
        html.text("folder)"),
      ]),
      html.li([], [
        html.p([], [html.text("Write a module declaration:")]),
        code.block(
          "declare module 'my-lib' {
	export function coolFeature(x: string): number;
}",
          code.TypeScript,
          [code.Filename("types/my-lib.d.ts")],
        ),
      ]),
      html.li([a.class("pt-4")], [
        html.text("Make sure your "),
        html.code([], [html.text("tsconfig.json")]),
        html.text(" includes the types folder (usually automatic)."),
      ]),
    ]),
    html.h2([], [html.text("Declaring Global Types")]),
    html.p([], [
      html.text(
        "Suppose you want to add a global variable that your runtime creates, or perhaps a library you're using doesn't have types for:",
      ),
    ]),
    code.block(
      "declare function myAwesomeFunction(x: string): number;",
      code.TypeScript,
      [code.Filename("globals.d.ts")],
    ),
    html.p([], [
      html.text(
        "Because this declaration file is NOT a module, this will be accessible everywhere in your program.",
      ),
    ]),
    html.p([], [
      html.text("What if you wanted to add something to the "),
      html.code([], [html.text("window")]),
      html.text(
        " object? TypeScript declares the window variable exists by assigning it to an interface called ",
      ),
      html.code([], [html.text("Window")]),
      html.text(", which is also declared globally. You can perform"),
      html.text(" "),
      html.a(
        [
          a.href(
            "https://www.typescriptlang.org/docs/handbook/declaration-merging.html",
          ),
        ],
        [html.text("Declaration Merging")],
      ),
      html.text(" "),
      html.text(
        "to extend that interface, and tell TypeScript about new properties that exist.",
      ),
    ]),
    code.block(
      "interface Window {
	myAwesomeFunction: (x: string) => number;
}",
      code.TypeScript,
      [code.Filename("globals.d.ts")],
    ),
    html.h2([], [html.text("Conflicts")]),
    html.p([], [
      html.text(
        "While doing research for the pull request mentioned at the beginning, I found a few cases where the compiler was not able to resolve the types of some of Bun's APIs because we had declared that certain symbols existed, where they might have already been declared by",
      ),
      html.text(" "),
      html.a(
        [
          a.href(
            "https://github.com/microsoft/TypeScript/blob/main/src/lib/dom.generated.d.ts",
          ),
        ],
        [html.text("lib.dom.d.ts")],
      ),
      html.text(" "),
      html.text(
        "(the builtin types that TypeScript provides by default) or things like",
      ),
      html.text(" "),
      html.code([], [html.text("@types/node")]),
      html.text(" (the types for Node.js). ."),
    ]),
    html.p([], [
      html.text(
        "Avoiding these conflicts is unfortunately not always possible. Bun implements a really solid best-effort approach to this, but sometimes you just have to get creative. For example, you might see code like this to \"force\" TypeScript to use one type over another:",
      ),
    ]),
    code.block(
      "declare var Worker: globalThis extends { onmessage: any; Worker: infer T }
	? T
	: never;",
      code.TypeScript,
      [code.Filename("my-globals.d.ts")],
    ),
    html.p([], [
      html.text(
        "Bun's types take this a step further by using a clever trick that lets us use the built-in types if they exist, with a graceful fallback when they don't.",
      ),
    ]),
    html.div([a.class("space-y-1")], [
      code.block(
        "declare module \"bun\" {
	namespace __internal {
		// `onabort` is defined in lib.dom.d.ts, so we can check to see if lib dom is loaded by checking if `onabort` is defined
		type LibDomIsLoaded = typeof globalThis extends { onabort: any } ? true : false;

		/**
		 * Helper type for avoiding conflicts in types.
		 *
		 * Uses the lib.dom.d.ts definition if it exists, otherwise defines it locally.
		 *
		 * This is to avoid type conflicts between lib.dom.d.ts and @types/bun.
		 *
		 * Unfortunately some symbols cannot be defined when both Bun types and lib.dom.d.ts types are loaded,
		 * and since we can't redeclare the symbol in a way that satisfies both, we need to fallback
		 * to the type that lib.dom.d.ts provides.
		 */
		type UseLibDomIfAvailable<GlobalThisKeyName extends PropertyKey, Otherwise> =
			LibDomIsLoaded extends true
				? typeof globalThis extends { [K in GlobalThisKeyName]: infer T } // if it is loaded, infer it from `globalThis` and use that value
					? T
					: Otherwise // Not defined in lib dom (or anywhere else), so no conflict. We can safely use our own definition
				: Otherwise; // Lib dom not loaded anyway, so no conflict. We can safely use our own definition
	}
}",
        code.TypeScript,
        [code.Filename("bun.d.ts")],
      ),
      code.block(
        "declare var Worker: Bun.__internal.UseLibDomIfAvailable<'Worker', {
	new(filename: string, options?: Bun.WorkerOptions): Worker;
}>;",
        code.TypeScript,
        [code.Filename("globals.d.ts")],
      ),
    ]),
    html.p([], [
      html.text("This declares that the "),
      html.code([], [html.text("Worker")]),
      html.text(
        " runtime value exists, and will use the version from TypeScript's builtin lib files if they're loaded already in the program, and if not it will use the version passed as the second argument.",
      ),
    ]),
    html.p([], [
      html.text(
        "This trick means we can write types that can exist in many different environments without worrying about impossible-to-fix conflicts breaking the build.",
      ),
    ]),
    html.hr([]),
    html.h2([], [html.text("Declaring entire modules as global namespaces")]),
    html.p([], [
      html.text("In Bun, everything importable from the "),
      html.code([], [html.text("'bun'")]),
      html.text(" module is also available on the global namespace "),
      html.code([], [html.text("Bun")]),
    ]),
    code.block(
      "import { file } from 'bun';
await file('test.txt').text();

// Or, exactly the same thing:

await Bun.file('test.txt').text();",
      code.TypeScript,
      [code.Filename("app.ts")],
    ),
    html.p([], [
      html.text(
        "In fact, you can do an equality to check to see that importing the module gives you the same reference to the global namespace.",
      ),
    ]),
    code.shell(
      "bun repl

Welcome to Bun v1.2.13
Type \".help\" for more information.

> require(\"bun\") === Bun
true",
      dollar_on_first_line_only: True,
    ),
    html.p([], [
      html.text(
        "Declaring this in TypeScript uses some strange syntax. You can",
      ),
      html.text(" "),
      html.a(
        [
          a.href(
            "https://github.com/oven-sh/bun/blob/main/packages/bun-types/bun.ns.d.ts#L3-L5",
          ),
        ],
        [html.text("find the declaration here")],
      ),
      html.text(", but it looks like this:"),
    ]),
    code.block(
      "import * as BunModule from \"bun\";

declare global {
	export import Bun = BunModule;
}",
      code.TypeScript,
      [code.Filename("bun.ns.d.ts")],
    ),
    html.p([], [html.text("Let's break it down")]),
    html.ol([], [
      html.li([], [
        html.p([], [
          html.text(
            "We have an import statement, so this file becomes a module.",
          ),
        ]),
      ]),
      html.li([], [
        html.p([], [
          html.text("We import everything from the "),
          html.code([], [html.text("bun")]),
          html.text(" module and alias to a namespace called"),
          html.text(" "),
          html.code([], [html.text("BunModule")]),
        ]),
      ]),
      html.li([], [
        html.p([], [
          html.text(
            "We use the `declare global` block to escape back into global scope, and then use the funky syntax ",
          ),
          html.code([], [html.text("export import")]),
          html.text(" to re-export the namespace to the global scope"),
        ]),
      ]),
    ]),
    html.p([], [
      html.text("This "),
      html.code([], [html.text("export import")]),
      html.text(
        " syntax a way of saying \"re-export this namespace\" - except when declaring on the global scope (inside a ",
      ),
      html.code([], [html.text("declare global "), html.text("{ }")]),
      html.text(
        " block or inside a script/global file) the export keyword kind of turns into a namespace declaration for the global scope.",
      ),
    ]),
    html.p([], [
      html.text("Here is the \"rest\" of "),
      html.code([], [html.text("@types/bun")]),
      html.text(" that piece this all together"),
    ]),
    html.div([a.class("space-y-1")], [
      code.block(
        "declare module \"bun\" {
	/**
	 * Creates a new BunFile instance
	 * @param path - The path to the file
	 * @returns A new BunFile instance
	 */
	function file(path: string): BunFile;

	interface BunFile {
		/* ... */
	}
}",
        code.TypeScript,
        [code.Filename("bun.d.ts")],
      ),
      code.block(
        "// You \"import\" types by using triple-slash references,
// which tell TypeScript to add these declarations to the build.

/// <reference path=\"./bun.d.ts\" />
/// <reference path=\"./bun.ns.d.ts\" />",
        code.TypeScript,
        [code.Filename("index.d.ts")],
      ),
      code.block(
        "{
	\"name\": \"@types/bun\",
	\"version\": \"1.2.13\",
	\"types\": \"./index.d.ts\",
	// ...
}",
        code.Json,
        [code.Filename("package.json")],
      ),
    ]),
    html.p([], [
      html.text(
        "In previous versions of Bun's types, the Bun global was defined as a variable that imported the ",
      ),
      html.code([], [html.text("bun")]),
      html.text(" module."),
    ]),
    code.block("declare var Bun: typeof import(\"bun\");", code.TypeScript, [
      code.Filename("globals.d.ts"),
    ]),
    html.p([], [
      html.text(
        "But since this is a runtime value, we have lost all of the types that are exported from the ",
      ),
      html.code([], [html.text("bun")]),
      html.text(" module. For example we can't use "),
      html.code([], [html.text("Bun.BunFile")]),
      html.text(" in our code."),
    ]),
    html.p([], [
      html.text(
        "In the pull request mentioned at the beginning, I changed previous declaration to use the",
      ),
      html.text(" "),
      html.code([], [html.text("export import")]),
      html.text(
        " syntax which fixed this issue. It means you can now use the Bun namespace exactly like you'd expect the ",
      ),
      html.code([], [html.text("bun")]),
      html.text(" module to behave."),
    ]),
    html.hr([]),
    html.h2([], [html.text("Ambient declaration gotchas")]),
    html.ul([], [
      html.li([], [
        html.b([], [
          html.text("\"Cannot find module\" or \"type not found\" errors:"),
        ]),
        html.text(" Make sure your"),
        html.text(" "),
        html.code([], [html.text(".d.ts")]),
        html.text(" file is included in the project (check "),
        html.code([], [html.text("tsconfig.json")]),
        html.text("'s"),
        html.text(" "),
        html.code([], [html.text("include")]),
        html.text("/"),
        html.code([], [html.text("exclude")]),
        html.text(")."),
      ]),
      html.li([], [
        html.b([], [html.text("Conflicts:")]),
        html.text(
          " If two libraries declare the same global, you'll get errors. Prefer module declarations, and avoid globals unless necessary.",
        ),
      ]),
    ]),
    html.h2([], [html.text("Resources")]),
    html.ul([], [
      html.li([], [
        html.a(
          [
            a.href(
              "https://github.com/oven-sh/bun/tree/main/packages/bun-types",
            ),
          ],
          [html.text("Bun's TypeScript types")],
        ),
      ]),
      html.li([], [
        html.a(
          [
            a.href(
              "https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html",
            ),
          ],
          [html.text("TypeScript Handbook: Declaration Files")],
        ),
      ]),
      html.li([], [
        html.a([a.href("https://github.com/DefinitelyTyped/DefinitelyTyped")], [
          html.text("DefinitelyTyped"),
        ]),
      ]),
    ]),
    html.br([]),
    html.div([a.class("text-xs")], [
      html.p([], [
        html.text("Thank you to "),
        html.a([a.href("https://cnrad.dev")], [html.text("Conrad")]),
        html.text(" and"),
        html.text(" "),
        html.a([a.href("https://looskie.com")], [html.text("Cody")]),
        html.text(" for reading revisions and helping with this article."),
      ]),
    ]),
  ])
}
