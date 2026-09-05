import attribute as a
import blog/post.{type Post, Post}
import gleam/option.{None, Some}
import html
import next/link
import react.{type Element}
import site/code
import site/date
import site/diagrams/carried
import site/diagrams/job_order
import site/diagrams/railway
import site/diagrams/resolve_flow
import site/diagrams/trace
import site/external_link
import site/safari_console
import site/terminal

const demo = "const p = Promise.resolve(1);
p.constructor = {
	get [Symbol.species]() {
		throw new Error(\"boom\");
	},
};

console.log(\"before\");
await p;
console.log(\"done\");"

pub fn post() -> Post {
  Post(
    name: "Fixing a WebKit bug to see if promises are made of train tracks",
    slug: "webkit-promise-railway",
    date: date.utc(2026, 8, 26),
    hidden: True,
    excerpt: "An in-depth explanation of promises in JavaScript, while fixing a WebKit bug",
    keywords: [
      "javascript",
      "promises",
      "webkit",
      "javascriptcore",
      "railway oriented programming",
      "gleam",
      "typescript",
    ],
    body: body,
  )
}

fn body() -> Element {
  react.fragment([
    html.p([], [
      html.text(
        "Here is a program that, until July, never finished in Bun or Safari.",
      ),
    ]),
    code.block(demo, code.JavaScript, [code.Filename("never.mjs")]),
    html.p([], [
      html.text(
        "Don't worry if this looks confusing. The spec says that because the getter throws an error, then ",
      ),
      html.code([], [html.text("await p")]),
      html.text(
        " should also throw, and so the program should crash. Node.js does, but Safari 26 and Bun 1.3.14 print ",
      ),
      html.code([], [html.text("'before'")]),
      html.text(", report the error, and then never finish."),
    ]),
    html.figure([a.class("not-prose my-8 grid gap-5 md:grid-cols-2")], [
      terminal.terminal(
        "node",
        [
          terminal.Cmd("node never.mjs"),
          terminal.Out("before"),
          terminal.Out("Error: boom"),
          terminal.Dim("exit 1"),
        ],
        running: False,
      ),
      terminal.terminal(
        "bun 1.3.14",
        [
          terminal.Cmd("bun never.mjs"),
          terminal.Out("before"),
          terminal.Out("error: boom"),
        ],
        running: True,
      ),
    ]),
    html.p([], [html.text("Safari 26 fails the same way as Bun:")]),
    safari_console.console(Some("Safari 26"), demo, [
      safari_console.LogRow([html.text("before")]),
      safari_console.ErrorRow([html.text("Error: boom")]),
    ]),
    html.p([], [
      html.text(
        "Bun and Safari both embed JavaScriptCore so the behaviour is the same - the promise is never settled! It is neither fulfilled nor rejected, so it stays pending forever. This was",
      ),
      html.text(" "),
      external_link.link(
        [a.href("https://bugs.webkit.org/show_bug.cgi?id=318399")],
        [html.text("WebKit bug 318399")],
      ),
      html.text(" "),
      html.text("and "),
      external_link.link(
        [a.href("https://github.com/WebKit/WebKit/pull/68749")],
        [html.text("my fix")],
      ),
      html.text(" "),
      html.text("was only +16 lines!"),
    ]),
    html.p([], [html.text("What went wrong?")]),
    html.h2([], [
      html.text("What "),
      html.code([], [html.text("resolve")]),
      html.text(" does"),
    ]),
    html.p([], [html.text("Let's quickly brush up on promises.")]),
    html.p([], [
      html.text(
        "When you construct a new promise in JavaScript, the engine creates two functions,",
      ),
      html.text(" "),
      html.code([], [html.text("resolve")]),
      html.text(" and "),
      html.code([], [html.text("reject")]),
      html.text(
        ", and passes them to the callback you pass to the promise constructor.",
      ),
    ]),
    code.block(
      "new Promise((resolve, reject) => {
	console.log(\"I got my resolve function!\", resolve);
	console.log(\"I got my reject function!\", reject);
	resolve(42);
});

// In V8 this logs:
//		I got my resolve function! ƒ () { [native code] }
//		I got my reject function! ƒ () { [native code] }",
      code.JavaScript,
      [code.Filename("new-promise.js")],
    ),
    html.p([], [
      html.text("The builtin helper function "),
      html.code([], [html.text("Promise.resolve(value)")]),
      html.text(
        " does the same thing by constructing a promise and immediately calling ",
      ),
      html.code([], [html.text("resolve")]),
      html.text(" with the value you passed (with the exception that if "),
      html.code([], [html.text("value")]),
      html.text(" is already a promise whose"),
      html.text(" "),
      html.code([], [html.text("constructor")]),
      html.text(" is "),
      html.code([], [html.text("Promise")]),
      html.text(
        ", it is returned as is). A simple userland implementation would look like this:",
      ),
    ]),
    code.block(
      "function PromiseDotResolve(value) {
	return new Promise(resolve => resolve(value))
}",
      code.JavaScript,
      [code.Filename("promise-resolve.js")],
    ),
    html.p([], [
      html.text("The same is also true for literally writing "),
      html.code([], [html.text("await 42")]),
      html.text(". The engine creates a promise and immediately calls "),
      html.code([], [html.text("resolve(42)")]),
      html.text(", just like"),
      html.text(" "),
      html.code([], [html.text("Promise.resolve()")]),
      html.text(" does, and the same exception applies."),
    ]),
    html.p([], [
      html.text(
        "Many folks think of a promise as a value that can end in two ways - fulfilled with a value or rejected with a reason. This is a reasonable approximation since it maps pretty closely to how using promises actually feels when writing JavaScript day-to-day. Therefore, a naive implementation of a promise might look like this:",
      ),
    ]),
    code.block(
      "type PromiseState<T> =
	| {type: 'pending'}
	| {type: 'resolved', value: T}
	| {type: 'rejected', value: unknown};

class MediocrePromise<T> {
	private state: PromiseState<T> = {type: 'pending'};
	private callbacks: Array<() => void> = []; // registered by .then()

	private resolve(value: T) {
		this.settle({type: 'resolved', value});
	}

	private reject(reason: unknown) {
		this.settle({type: 'rejected', value: reason});
	}

	private settle(state: PromiseState<T>) {
		this.state = state;
		for (const callback of this.callbacks) callback();
	}

	// For example's sake this is missing `constructor`, `then`, etc.
}",
      code.TypeScript,
      [code.Filename("mediocre-promise.ts")],
    ),
    html.p([], [
      html.text(
        "I've called it MediocrePromise. It has a pending state, a way to resolve with a value, and a way to reject with a reason. It even has a list of callbacks to run, just like a real promise! Is this a good implementation?",
      ),
    ]),
    html.p([], [
      html.text(
        "Sadly, no. It is not a good implementation. MediocrePromise misses an important difference between how resolving and rejecting work.",
      ),
    ]),
    html.p([], [
      html.text(
        "Let's start with rejections. Rejecting a promise is simple! Calling",
      ),
      html.text(" "),
      html.code([], [html.text("reject(reason)")]),
      html.text(" marks the promise as rejected, with "),
      html.code([], [html.text("reason")]),
      html.text(
        " as the rejected value. Excellent! MediocrePromise implements rejections correctly!",
      ),
    ]),
    html.p([], [
      html.text("Resolving is more complex. Calling "),
      html.code([], [html.text("resolve(value)")]),
      html.text(" does "),
      html.i([], [html.text("not")]),
      html.text(" store"),
      html.text(" "),
      html.code([], [html.text("value")]),
      html.text(" straight away. First, it checks whether "),
      html.code([], [html.text("value")]),
      html.text(" has a"),
      html.text(" "),
      html.code([], [html.text(".then()")]),
      html.text(" method. If it "),
      html.b([], [html.text("doesn't")]),
      html.text(
        " (e.g. a number, a string, an object without one, ..) the promise is ",
      ),
      html.b([], [html.text("fulfilled")]),
      html.text(" with "),
      html.code([], [html.text("value")]),
      html.text(" and we are done. Otherwise, if it "),
      html.b([], [html.text("does")]),
      html.text(" have a "),
      html.code([], [html.text(".then()")]),
      html.text(" method, "),
      html.code([], [html.text("value")]),
      html.text(" is treated like "),
      html.i([], [html.text("another")]),
      html.text(" promise. Our original promise is "),
      html.i([], [html.text("not")]),
      html.text(" settled yet and instead, "),
      html.code([], [html.text("resolve")]),
      html.text(" passes itself and the reject function to"),
      html.text(" "),
      html.code([], [html.text("value.then(resolve, reject)")]),
      html.text(". Whichever of those functions"),
      html.text(" "),
      html.code([], [html.text("value.then()")]),
      html.text(" "),
      html.i([], [html.text("eventually")]),
      html.text(
        " calls is what settles the promise. Sorry, that was a mouthful. There's a diagram in a sec to explain. Bear with me.",
      ),
    ]),
    html.p([], [
      html.text("The "),
      html.code([], [html.text("resolve")]),
      html.text(" function"),
      html.text(" "),
      external_link.link(
        [a.href("https://tc39.es/ecma262/#sec-promise-resolve-functions")],
        [html.text("is defined in the spec")],
      ),
      html.text(" "),
      html.text("as the "),
      html.b([], [html.text("resolve procedure")]),
      html.text(". To find out whether "),
      html.code([], [html.text("value")]),
      html.text(" has a"),
      html.text(" "),
      html.code([], [html.text(".then")]),
      html.text(", it reads "),
      html.code([], [html.text("value.then")]),
      html.text(
        ", and a property read can run a getter, and a getter can throw (just like in our program at the beginning). So, looking for a ",
      ),
      html.code([], [html.text(".then()")]),
      html.text(" method on some value can result in three possible outcomes:"),
    ]),
    resolve_flow.diagram("resolve-flow-1"),
    html.p([], [
      html.text(
        "Our MediocrePromise is missing the extra check and additional behaviour!",
      ),
    ]),
    html.p([], [
      html.text("This asymmetry exists because"),
      html.text(" "),
      html.i([], [
        html.b([], [html.text("a failure is not a pending operation")]),
      ]),
      html.text(". When something fails, you "),
      html.b([], [html.text("already")]),
      html.text(
        " have the reason in your code (presumably an error)! So you can call ",
      ),
      html.code([], [html.text("reject(reason)")]),
      html.text(
        " immediately. This is not the case for the happy path of resolving, where a useful value might arrive later:",
      ),
    ]),
    code.block(
      "reject(new Error(\"bad request\")); // the reason is right here
resolve(response.json());         // the body is still arriving",
      code.JavaScript,
      [],
    ),
    html.p([], [
      html.text("This is why the extra behaviour is only implemented in "),
      html.code([], [html.text("resolve")]),
      html.text("."),
    ]),
    html.p([], [
      html.text("In the path where "),
      html.code([], [html.text("value.then")]),
      html.text(" "),
      html.i([], [html.text("is")]),
      html.text(" a function, the spec considers"),
      html.text(" "),
      html.code([], [html.text("value")]),
      html.text(" to be a "),
      html.b([], [html.text("thenable")]),
      html.text(". Promises are thenables, since they have a"),
      html.text(" "),
      html.code([], [html.text(".then()")]),
      html.text(" method. Any other object with a "),
      html.code([], [html.text(".then()")]),
      html.text(
        " method is a thenable too. Thenables work everywhere a promise would.",
      ),
    ]),
    html.p([], [
      html.text("Simply put: a "),
      html.b([], [html.text("thenable")]),
      html.text(" is any value with a "),
      html.code([], [html.text(".then()")]),
      html.text(" method. Therefore, any promise is also a thenable."),
    ]),
    html.p([], [html.text("For example:")]),
    code.block(
      "// `thenable` is not a promise!
const thenable = {
	// resolve(thenable) calls this with the outer promise's resolve and reject
	then(resolve, _reject) {
		resolve(42);
	},
};

// resolve() called with the thenable
await new Promise(resolve => resolve(thenable)); // 42

// a .then callback returning the thenable
await Promise.resolve().then(() => thenable); // 42

// await on the thenable directly
await thenable; // 42",
      code.JavaScript,
      [],
    ),
    html.p([], [
      html.text(
        "The spec calls the aforementioned process of passing the resolve/reject functions to a thenable's ",
      ),
      html.code([], [html.text(".then()")]),
      html.text(" "),
      html.b([], [html.text("assimilation")]),
      html.text(". But, perhaps a friendlier word is"),
      html.text(" "),
      html.b([], [html.text("flattening")]),
      html.text(
        ": instead of holding the inner thenable as its value, the outer promise waits for it, so two layers become one.",
      ),
    ]),
    html.p([], [
      html.text(
        "Lastly, note that \"resolved\" isn't a real promise state. MediocrePromise also got this one wrong! Once ",
      ),
      html.code([], [html.text("resolve")]),
      html.text(" has been called the promise is "),
      html.b([], [html.text("locked-in")]),
      html.text(" to an outcome, but it can absolutely still be pending:"),
    ]),
    code.block(
      "const inner = new Promise(() => {}); // never settles
const outer = new Promise(resolve => resolve(inner));",
      code.JavaScript,
      [],
    ),
    html.p([], [
      html.text("Here, "),
      html.code([], [html.text("outer")]),
      html.text(" was resolved, but it stays pending forever because"),
      html.text(" "),
      html.code([], [html.text("inner")]),
      html.text(" never settles. MediocrePromise's "),
      html.code([], [html.text("resolved")]),
      html.text(" state was actually the spec's definition of fulfilled."),
    ]),
    html.h2([], [html.text("Railways")]),
    html.p([], [html.text("Let's go down a quick tangent.")]),
    html.p([], [
      html.text("Scott Wlaschin's article"),
      html.text(" "),
      external_link.link([a.href("https://fsharpforfunandprofit.com/rop/")], [
        html.text("Railway Oriented Programming"),
      ]),
      html.text(" "),
      html.text(
        "draws fallible code as a piece of track with one input and two outputs: a success track and a failure track.",
      ),
    ]),
    railway.railway(
      "railway-1",
      railway.Props(
        input: "request",
        steps: ["validate()"],
        success: "success",
        failure: "failure",
        untyped_failure: False,
        train: None,
      ),
    ),
    html.p([], [
      html.text(
        "Once a request hits the failure track it stays there, skipping every later step, until something at the end deals with the result. Wlaschin calls joining two pieces of the railway ",
      ),
      html.i([], [html.text("binding")]),
      html.text(" - not to be confused with JavaScript's "),
      html.code([], [html.text("fn.bind()")]),
      html.text(". Rust folks might know binding as "),
      html.code([], [html.text("and_then")]),
      html.text(", or maybe the "),
      html.code([], [html.text("?")]),
      html.text(
        " operator. They all mean the same thing: run the next bit of code only if the previous bit succeeded, otherwise pass the failure straight through.",
      ),
    ]),
    html.p([], [
      html.text("Look at how the last step is skipped because the "),
      html.code([], [html.text("update()")]),
      html.text(" failed:"),
    ]),
    railway.railway(
      "railway-2",
      railway.Props(
        input: "request",
        steps: ["validate()", "update()", "send()"],
        success: "success",
        failure: "failure",
        untyped_failure: False,
        train: Some(railway.DerailAt(1)),
      ),
    ),
    html.p([], [
      html.text(
        "You can think of each piece of the railway as a function returning a ",
      ),
      html.code([], [html.text("Result")]),
      html.text(". In strongly typed languages, most implementations of a "),
      html.code([], [html.text("Result")]),
      html.text(" type will accept "),
      html.b([], [html.text("two type parameters")]),
      html.text(
        ", the success type and the failure type, one per track. For example in Rust you could imagine a ",
      ),
      html.code([], [html.text("validate")]),
      html.text(" function's signature being:"),
    ]),
    code.block(
      "fn validate(request: Request) -> Result<Request, ValidationError>",
      code.Rust,
      [],
    ),
    html.p([], [
      html.text("To chain "),
      html.code([], [html.text("validate()")]),
      html.text(" with the other steps using "),
      html.code([], [html.text("and_then")]),
      html.text(", every piece has to fail with the "),
      html.i([], [html.text("same")]),
      html.text(" type. So instead of "),
      html.code([], [html.text("ValidationError")]),
      html.text(", lets make each function return an "),
      html.code([], [html.text("AppError")]),
      html.text(", an enum of every way a request can fail:"),
    ]),
    code.block(
      "enum AppError {
	Validation(ValidationError),
	Database(DatabaseError),
	Network(NetworkError),
}

fn validate(request: Request) -> Result<Request, AppError> { /* ... */ }
fn update(request: Request) -> Result<Record, AppError> { /* ... */ }
fn send(record: Record) -> Result<Receipt, AppError> { /* ... */ }

validate(request).and_then(update).and_then(send) // Result<Receipt, AppError>",
      code.Rust,
      [],
    ),
    html.p([], [
      html.text(
        "Promises in JavaScript kinda look a lot like this! There's a fulfilled track and a rejected track, and ",
      ),
      html.code([], [html.text(".then(onFulfilled, onRejected)")]),
      html.text(" is a switch between them."),
    ]),
    railway.railway(
      "railway-3",
      railway.Props(
        input: "promise",
        steps: [".then(validate)", ".then(update)", ".then(send)"],
        success: "fulfilled",
        failure: "rejected",
        untyped_failure: False,
        train: Some(railway.DerailAt(1)),
      ),
    ),
    html.h2([], [html.text("The job")]),
    html.p([], [
      html.text("As a reminder, here's that "),
      html.b([], [html.text("resolve procedure")]),
      html.text(" diagram again:"),
    ]),
    resolve_flow.diagram("resolve-flow-2"),
    html.p([], [
      html.text("In the path on the right, where "),
      html.code([], [html.text("value.then")]),
      html.text(" is a function, the engine does not call the "),
      html.code([], [html.text(".then()")]),
      html.text(
        " immediately. Instead, the engine queues a job, which we call a microtask. The spec names this particular job a",
      ),
      html.text(" "),
      external_link.link(
        [a.href("https://tc39.es/ecma262/#sec-newpromiseresolvethenablejob")],
        [html.code([], [html.text("NewPromiseResolveThenableJob")])],
      ),
      html.text(" "),
      html.text("and it is defined as follows:"),
    ]),
    html.blockquote([a.class("[quotes:none]")], [
      html.p([], [
        html.text("a. Let "),
        html.i([], [html.text("resolvingFunctions")]),
        html.text(" be CreateResolvingFunctions("),
        html.i([], [html.text("promiseToResolve")]),
        html.text(")."),
      ]),
      html.p([], [
        html.text("b. Let "),
        html.i([], [html.text("thenCallResult")]),
        html.text(" be Completion(HostCallJobCallback("),
        html.i([], [html.text("then")]),
        html.text(","),
        html.text(" "),
        html.i([], [html.text("thenable")]),
        html.text(", « "),
        html.i([], [html.text("resolvingFunctions")]),
        html.text(".[[Resolve]], "),
        html.i([], [html.text("resolvingFunctions")]),
        html.text(".[[Reject]] »))."),
      ]),
      html.p([], [
        html.text("c. If "),
        html.i([], [html.text("thenCallResult")]),
        html.text(" is an abrupt completion, return ? Call("),
        html.i([], [html.text("resolvingFunctions")]),
        html.text(".[[Reject]], undefined, « "),
        html.i([], [html.text("thenCallResult")]),
        html.text(".[[Value]] »)."),
      ]),
    ]),
    html.p([], [html.text("Sorry, that's another mouthful. Let me translate:")]),
    html.ol([a.type_("a")], [
      html.li([], [html.text("Create a new resolve/reject function pair")]),
      html.li([], [
        html.text("Call the thenable's "),
        html.code([], [html.text(".then(resolve, reject)")]),
        html.text(" function (with the newly created resolve/reject functions)"),
      ]),
      html.li([], [
        html.text("If calling "),
        html.code([], [html.text(".then()")]),
        html.text(" throws, reject the promise with whatever was thrown"),
      ]),
    ]),
    html.p([], [
      html.text("Remember that "),
      html.code([], [html.text(".then")]),
      html.text(
        " is simply whatever is defined on the thenable. If the thenable is a real promise, the method being called is the one on the prototype,",
      ),
      html.text(" "),
      html.code([], [html.text("Promise.prototype.then")]),
      html.text("."),
    ]),
    html.p([], [html.text("Here's the important line of our program again:")]),
    code.block(
      "p.constructor = {
	get [Symbol.species]() {
		throw new Error(\"boom\");
	},
};",
      code.JavaScript,
      [],
    ),
    html.p([], [
      html.text("We only changed "),
      html.code([], [html.text("p")]),
      html.text(" here, so the global "),
      html.code([], [html.text("Promise")]),
      html.text(" is untouched."),
    ]),
    html.p([], [
      html.code([], [html.text("await p")]),
      html.text(" only reuses "),
      html.code([], [html.text("p")]),
      html.text(" when "),
      html.code([], [html.text("p.constructor")]),
      html.text(" is"),
      html.text(" "),
      html.code([], [html.text("Promise")]),
      html.text(", so it makes a new promise and calls "),
      html.code([], [html.text("resolve(p)")]),
      html.text(" instead."),
    ]),
    html.p([], [
      html.code([], [html.text("p")]),
      html.text(" has a "),
      html.code([], [html.text(".then()")]),
      html.text(", so it is a thenable, so "),
      html.code([], [html.text("resolve")]),
      html.text(" "),
      html.text("calls "),
      html.code([], [html.text("p.then(resolve, reject)")]),
      html.text(". Now, we saw our program crash, so"),
      html.text(" "),
      html.code([], [html.text("Promise.prototype.then")]),
      html.text(" must somehow eventually be accessing"),
      html.text(" "),
      html.code([], [html.text("p.constructor[Symbol.species]")]),
      html.text(", right? But why on earth would"),
      html.text(" "),
      html.code([], [html.text(".then()")]),
      html.text(" care about a "),
      html.code([], [html.text("Symbol.species")]),
      html.text(" getter?"),
    ]),
    html.p([], [
      html.text("It cares because "),
      html.code([], [html.text(".then()")]),
      html.text(" returns a "),
      html.i([], [html.text("new")]),
      html.text(" promise, which is what lets you chain "),
      html.code([], [html.text(".then().then()")]),
      html.text(". If you subclass "),
      html.code([], [html.text("Promise")]),
      html.text(", you'd expect"),
      html.text(" "),
      html.code([], [html.text(".then()")]),
      html.text(" to return an instance of your subclass, not a plain"),
      html.text(" "),
      html.code([], [html.text("Promise")]),
      html.text(":"),
    ]),
    code.block(
      "class MyPromise extends Promise {}
MyPromise.resolve(1).then(x => x) instanceof MyPromise; // true",
      code.JavaScript,
      [],
    ),
    html.p([], [
      html.text("So before a real promise's "),
      html.code([], [html.text("then")]),
      html.text(
        " does anything with its arguments, it works out which constructor to build the ",
      ),
      html.i([], [html.text("new")]),
      html.text(" promise with. It does this by first reading"),
      html.text(" "),
      html.code([], [html.text("this.constructor")]),
      html.text(" and then by reading "),
      html.code([], [html.text("constructor[Symbol.species]")]),
      html.text(" "),
      html.text("(the spec calls this step"),
      html.text(" "),
      external_link.link(
        [a.href("https://tc39.es/ecma262/#sec-speciesconstructor")],
        [html.code([], [html.text("SpeciesConstructor")])],
      ),
      html.text(
        "). Both are ordinary property reads and, as we found out, property reads can run getters, and getters can throw!",
      ),
    ]),
    html.p([], [
      html.text(
        "This is precisely what our original program at the beginning does! We made",
      ),
      html.text(" "),
      html.code([], [html.text("p.constructor")]),
      html.text(" have a "),
      html.code([], [html.text("Symbol.species")]),
      html.text(" getter that throws, so"),
      html.text(" "),
      html.code([], [html.text("p.then(resolve, reject)")]),
      html.text(" throws during the species lookup, before it has stored "),
      html.code([], [html.text("resolve")]),
      html.text(" and "),
      html.code([], [html.text("reject")]),
      html.text(" as callbacks. Recall that Step C of"),
      html.text(" "),
      html.code([], [html.text("NewPromiseResolveThenableJob")]),
      html.text(" makes the engine reject the promise if calling"),
      html.text(" "),
      html.code([], [html.text(".then()")]),
      html.text(
        " throws - this is the spec-correct behaviour we saw in V8/Node.js.",
      ),
    ]),
    html.p([], [
      html.text(
        "So why do Safari and Bun hang instead of rejecting the promise?",
      ),
    ]),
    html.p([], [
      html.text(
        "JavaScriptCore had a fast path for the most-common case where the thenable is a real, normal promise, and that fast path did the species lookup ",
      ),
      html.i([], [html.text("first")]),
      html.text(
        ", only creating the resolve/reject functions afterwards. When the lookup threw (like how our program does), the resolving functions didn't exist yet, so there was nothing to reject with. The exception escaped the job entirely (that's the red ",
      ),
      html.code([], [html.text("Error: boom")]),
      html.text(" in the inspector) and our promise stayed pending forever."),
    ]),
    html.p([], [html.text("Here's that as a railway:")]),
    job_order.diagram("job-order-1"),
    html.p([], [
      html.text(
        "Our train had effectively derailed! We didn't even get the chance to finish our journey on either track and so the original program hung because the train never even arrived at the station!",
      ),
    ]),
    html.p([], [
      html.text(
        "Luckily, the fix is simple, and might already be obvious to you! We must create our resolve/reject functions before calling ",
      ),
      html.code([], [html.text(".then()")]),
      html.text(
        ", so that we actually have the ability to reject the promise if calling ",
      ),
      html.code([], [html.text(".then()")]),
      html.text(
        " throws. Creating the resolving functions is just an allocation and allocations can't throw, and once the functions exist, the existing error handling rejects the promise just like any other failure would.",
      ),
    ]),
    html.h2([], [html.text("So is a promise a railway?")]),
    html.p([], [
      html.text("In TypeScript, the "),
      html.code([], [html.text("Promise<T>")]),
      html.text(
        " interface has only one type parameter and offers no way for a developer to express ways in which the promise might reject:",
      ),
    ]),
    code.block("declare const p: Promise<number>;", code.TypeScript, []),
    html.p([], [
      html.text("TypeScript users have asked for a "),
      html.code([], [html.text("Promise<T, E>")]),
      html.text(" to exist since 2015 - see this issue:"),
      html.text(" "),
      external_link.link(
        [a.href("https://github.com/microsoft/TypeScript/issues/6283")],
        [html.text("microsoft/TypeScript#6283")],
      ),
      html.text(
        "! Ron Buckton, who used to work on TypeScript at Microsoft, closed this issue, stating:",
      ),
    ]),
    html.blockquote([], [
      html.p([], [
        html.text(
          "we cannot guarantee the correct type of the exception at design time.",
        ),
      ]),
    ]),
    html.p([], [
      html.text(
        "Which we have now learnt is true! Earlier, we saw the runtime reject a promise with",
      ),
      html.text(" "),
      html.code([], [html.text("boom")]),
      html.text(": "),
      html.code([], [html.text("p.then()")]),
      html.text(" read a "),
      html.code([], [html.text("Symbol.species")]),
      html.text(
        " getter that threw the error, and Step C of the job rejected the promise with it, very far away from any userland ",
      ),
      html.code([], [html.text("reject()")]),
      html.text(
        " call! If the spec itself can put values on the reject track, then even code that only ever calls ",
      ),
      html.code([], [html.text("reject()")]),
      html.text(" with one type cannot be given an "),
      html.code([], [html.text("E")]),
      html.text(". The failure track has to be "),
      html.code([], [html.text("any")]),
      html.text(" (okay, yes, it could technically be "),
      html.code([], [html.text("unknown")]),
      html.text(
        ", but adoption and backwards compatibility are also important things for a project of TypeScript's scope and size to care about!).",
      ),
    ]),
    html.p([], [html.text("Here's that represented as a railway:")]),
    railway.railway(
      "railway-4",
      railway.Props(
        input: "resolve(value)",
        steps: ["read value.then", "call value.then"],
        success: "T",
        failure: "any",
        untyped_failure: True,
        train: None,
      ),
    ),
    html.p([], [
      html.text(
        "Look - we have no control over that failure track! This means we ",
      ),
      html.i([], [html.text("can")]),
      html.text(
        " draw promises as railways but it's a bit less useful than a real result type, like Rust's.",
      ),
    ]),
    html.h2([], [html.text("What could a new language do about this?")]),
    html.p([], [
      html.text("You might have seen me talk about"),
      html.text(" "),
      external_link.link([a.href("https://gleam.run")], [html.text("Gleam")]),
      html.text(
        " before. It's really good, and I write lots of it. It is a typed language that compiles to the BEAM and to",
      ),
      html.text(" "),
      external_link.link(
        [a.href("https://gleam.run/news/v0.16-gleam-compiles-to-javascript/")],
        [html.text("JavaScript")],
      ),
      html.text(", which is how "),
      link.link([a.href("/gleam-bun-apps")], [html.text("my last post")]),
      html.text(
        " built Bun executables from it. It's almost impossible to write modern JavaScript without eventually handling promises, so the library that does that in Gleam -",
      ),
      html.text(" "),
      external_link.link(
        [
          a.href(
            "https://hexdocs.pm/gleam_javascript/gleam/javascript/promise.html",
          ),
        ],
        [html.code([], [html.text("gleam_javascript")])],
      ),
      html.text(" "),
      html.text("- needs a promise type. It's defined like this:"),
    ]),
    code.block("pub type Promise(value)", code.Gleam, []),
    html.p([], [
      html.text(
        "Very simple! And look, just like TypeScript, there's no error type parameter.",
      ),
    ]),
    html.p([], [
      html.text(
        "In the Gleam source, there's a doc comment above it that says \"not generic over the error type as any Gleam panic or JavaScript exception could alter the error value\", which would make it \"unsound and untypable\". In other words, the failure track is intentionally left unlabelled, just like TypeScript.",
      ),
    ]),
    html.p([], [
      html.text(
        "Since the reject track can't be typed, Gleam doesn't use it. Instead, the pattern in Gleam is to always hold a ",
      ),
      html.code([], [html.text("Result")]),
      html.text(" in the "),
      html.i([], [html.text("fulfilled")]),
      html.text(
        " track. For example, here is a function signature you might see in your Gleam code:",
      ),
    ]),
    code.block(
      "fn get_user() -> Promise(Result(User, DatabaseError))",
      code.Gleam,
      [],
    ),
    html.p([], [
      html.text(
        "Can we draw this on train tracks? Yes! But in a slightly different way:",
      ),
    ]),
    carried.diagram("carried-1"),
    html.p([], [
      html.text("Gleam's pattern of "),
      html.code([], [html.text("Promise(Result(a, e))")]),
      html.text(
        " encodes a two-track result onto a one-track promise. The promise's own reject track is still there, and still untyped, but now it's only ever used for absolute disasters.",
      ),
    ]),
    html.p([], [
      html.text("The "),
      html.code([], [html.text("try_await")]),
      html.text(" function is Gleam's version of binding."),
    ]),
    code.block(
      "pub fn try_await(
	promise: Promise(Result(a, e)),
	callback: fn(a) -> Promise(Result(b, e)),
) -> Promise(Result(b, e))",
      code.Gleam,
      [],
    ),
    html.p([], [
      html.text(
        "Sorry if this syntax looks a bit new and scary. The lowercase letters are how Gleam represents type-parameters. Below is the equivalent TypeScript to help you understand and translate:",
      ),
    ]),
    code.block(
      "function tryAwait<A, B, E>(
	promise: Promise<Result<A, E>>,
	callback: (value: A) => Promise<Result<B, E>>,
): Promise<Result<B, E>>",
      code.TypeScript,
      [],
    ),
    html.p([], [
      html.text("With Gleam's"),
      html.text(" "),
      external_link.link(
        [a.href("https://tour.gleam.run/advanced-features/use/")],
        [html.code([], [html.text("use")])],
      ),
      html.text(" "),
      html.text(
        "syntax, a chain of them reads like normal straight-line code, or code that is on a single straight-line train track.",
      ),
    ]),
    code.block(
      "pub fn main() {
	use version <- promise.try_await(read_version(\"./VERSION\"))
	use range <- promise.try_await(parse_range(\"^2.0.0\"))
	promise.resolve(Ok(semver.satisfies(version, range)))
}",
      code.Gleam,
      [code.Filename("src/app.gleam")],
    ),
    html.p([], [html.text("Super tidy! Thank you Gleam, very cool.")]),
    html.p([], [
      html.text(
        "In this example each of the promises are fallible and every failure is a well-known type, yet nothing ever calls ",
      ),
      html.code([], [html.text(".catch()")]),
      html.text(
        "! You could totally do the same in TypeScript by always using a result type in promises: ",
      ),
      html.code([], [html.text("Promise<Result<T, E>>")]),
      html.text(", or with something like"),
      html.text(" "),
      external_link.link([a.href("https://github.com/supermacro/neverthrow")], [
        html.text("neverthrow"),
      ]),
      html.text("'s "),
      html.code([], [html.text("ResultAsync")]),
      html.text("."),
    ]),
    html.p([], [html.text("There is one thing in the way, though.")]),
    html.p([], [
      html.text("Unlike TypeScript, "),
      html.code([], [html.text("gleam_javascript")]),
      html.text(" does not offer a way to call"),
      html.text(" "),
      html.code([], [html.text(".then()")]),
      html.text(
        ", and not even an equivalent-but-differently-named method! Instead the continuation behaviour is split into two separate methods. These are named map and await:",
      ),
    ]),
    code.block(
      "pub fn map(promise: Promise(a), callback: fn(a) -> b) -> Promise(b)
pub fn await(promise: Promise(a), callback: fn(a) -> Promise(b)) -> Promise(b)",
      code.Gleam,
      [],
    ),
    html.p([], [
      html.text("According to these signatures, "),
      html.code([], [html.text("map")]),
      html.text(" will never flatten a promise and"),
      html.text(" "),
      html.code([], [html.text("await")]),
      html.text(" will flatten exactly once. Both call "),
      html.code([], [html.text(".then()")]),
      html.text(" internally, which is a problem for "),
      html.code([], [html.text("map")]),
      html.text(" when the callback returns a promise."),
    ]),
    html.p([], [
      html.text("Let's try to implement a naive version of Gleam's "),
      html.code([], [html.text("promise.map")]),
      html.text(" function:"),
    ]),
    code.block(
      "// a very naive map: just .then()
const map = (promise, callback) => promise.then(callback);

const q = map(Promise.resolve(1), n => Promise.resolve(n + 1));
await q; // 2, the engine flattened it",
      code.JavaScript,
      [],
    ),
    html.p([], [
      html.text("The signature says "),
      html.code([], [html.text("q")]),
      html.text(" is a "),
      html.code([], [html.text("Promise(Promise(Int))")]),
      html.text(", but the engine flattened it, so "),
      html.code([], [html.text("q")]),
      html.text(" actually holds "),
      html.code([], [html.text("2")]),
      html.text(". Gleam's type checker would be wrong about "),
      html.code([], [html.text("q")]),
      html.text("! Anything that trusts that type will crash, because"),
      html.text(" "),
      html.code([], [html.text("map")]),
      html.text(" tries to call "),
      html.code([], [html.text(".then()")]),
      html.text(" on a value that is actually"),
      html.text(" "),
      html.code([], [html.text("2")]),
      html.text(":"),
    ]),
    code.block(
      "use inner <- promise.await(q)     // inner: Promise(Int), says the compiler
promise.map(inner, int.to_string) // TypeError: promise.then is not a function",
      code.Gleam,
      [],
    ),
    html.p([], [
      html.text("This is the problem we touched on earlier: "),
      html.code([], [html.text("Promise<Promise<T>>")]),
      html.text(" "),
      html.text(
        "cannot be constructed because, remember, if you resolve a promise with another promise then we just wait for that second promise instead.",
      ),
    ]),
    html.p([], [
      html.text("So, to give "),
      html.code([], [html.text("map")]),
      html.text(" an honest type, "),
      html.code([], [html.text("gleam_javascript")]),
      html.text(" hides the promise by wrapping it in an extra layer:"),
    ]),
    code.block(
      "// A wrapper around a promise to prevent `Promise<Promise<T>>`
// collapsing into `Promise<T>`.
class PromiseLayer {
	constructor(promise) { this.promise = promise; }
	static wrap(value)   { return value instanceof Promise ? new PromiseLayer(value) : value; }
	static unwrap(value) { return value instanceof PromiseLayer ? value.promise : value; }
}",
      code.JavaScript,
      [
        code.Filename("gleam_javascript_ffi.mjs"),
        code.Footer(
          react.fragment([
            html.text("Source:"),
            html.text(" "),
            external_link.link(
              [
                a.class("text-inherit"),
                a.href(
                  "https://github.com/gleam-lang/javascript/blob/b51b4365c2b5fa3f9767a349a7e7a68a874264cb/src/gleam_javascript_ffi.mjs#L44",
                ),
              ],
              [
                html.text(
                  "github.com/gleam-lang/javascript#b51b4365c2b5fa3f9767a349a7e7a68a874264cb",
                ),
              ],
            ),
          ]),
        ),
      ],
    ),
    html.p([], [
      html.text("Here is what "),
      html.code([], [html.text("map")]),
      html.text(" and "),
      html.code([], [html.text("await")]),
      html.text(" do with it, one step per line:"),
    ]),
    code.block(
      "export function promise_map(promise, fn) {
	return promise.then((value) => {
		const unwrapped = PromiseLayer.unwrap(value); // take off any layer from the previous step
		const result = fn(unwrapped);                 // run your callback
		return PromiseLayer.wrap(result);             // if it returned a promise, hide it
	});
}

export function promise_await(promise, fn) {
	return promise.then((value) => {
		const unwrapped = PromiseLayer.unwrap(value);
		return fn(unwrapped);                         // no wrap: a returned promise gets followed
	});
}",
      code.JavaScript,
      [code.Filename("gleam_javascript_ffi.mjs (unrolled)")],
    ),
    html.p([], [
      html.text(
        "If we try to resolve a promise with another promise wrapped in the PromiseLayer, the engine does not follow it and the PromiseLayer is returned:",
      ),
    ]),
    trace.diagram("trace-1", [
      trace.Event(
        text: "resolve(new PromiseLayer(inner))",
        tone: None,
        note: Some("the wrapper has no .then"),
      ),
      trace.Event(
        text: "outer fulfilled with the wrapper",
        tone: Some(trace.Ok),
        note: None,
      ),
    ]),
    html.p([], [
      html.text("The "),
      html.code([], [html.text("await")]),
      html.text(" function does not "),
      html.code([], [html.text("wrap")]),
      html.text(
        ", so a returned promise is followed, which is the flattening behaviour that its signature guarantees.",
      ),
    ]),
    html.p([], [
      html.text(
        "TypeScript decided to tackle this problem the other way and instead of ",
      ),
      html.i([], [html.text("stopping")]),
      html.text(
        " the flattening, they made the type system understand flattening.",
      ),
    ]),
    html.p([], [
      html.text("In 4.5, the TypeScript team added the"),
      html.text(" "),
      external_link.link(
        [
          a.href(
            "https://devblogs.microsoft.com/typescript/announcing-typescript-4-5/#the-awaited-type-and-promise-improvements",
          ),
        ],
        [html.code([], [html.text("Awaited<T>")])],
      ),
      html.text(" "),
      html.text(
        "type, which the release notes describe as modelling \"the way that ",
      ),
      html.code([], [html.text("await")]),
      html.text(" and"),
      html.text(" "),
      html.code([], [html.text(".then")]),
      html.text(" recursively unwrap Promises\" - so"),
      html.text(" "),
      html.code([], [html.text("Awaited<Promise<Promise<number>>>")]),
      html.text(" is just"),
      html.text(" "),
      html.code([], [html.text("number")]),
      html.text("."),
    ]),
    html.p([], [
      html.text(
        "JavaScript implements this promise flattening behaviour because back when the promise spec was being worked on in 2013 there were many competing userland implementations of promises. You might've seen jQuery's deferreds, Q, Bluebird, etc in older, pre-promises JavaScript code. The one thing these libraries all had in common was that they all had a",
      ),
      html.text(" "),
      html.code([], [html.text(".then()")]),
      html.text(" method - now we know those objects are called "),
      html.b([], [html.text("thenable")]),
      html.text("s!"),
    ]),
    html.p([], [
      html.text(
        "To ease the ecosystem into the migration, the team working on the spec decided to allow any thenable to interop with another, and thus the behaviour of an outer promise waiting on an inner promise (thenable) was decided on.",
      ),
    ]),
    html.p([], [
      html.text("Much of the original discussion is still preserved in"),
      html.text(" "),
      external_link.link(
        [
          a.href(
            "https://esdiscuss.org/topic/a-challenge-problem-for-promise-designers-was-re-futures",
          ),
        ],
        [html.text("the es-discuss thread")],
      ),
      html.text(", Forbes Lindesay's"),
      html.text(" "),
      external_link.link(
        [a.href("https://gist.github.com/ForbesLindesay/5392612")],
        [html.text("Against Promises For Promises")],
      ),
      html.text(", and"),
      html.text(" "),
      external_link.link(
        [a.href("https://github.com/domenic/promises-unwrapping/issues/54")],
        [html.text("promises-unwrapping #54")],
      ),
      html.text(
        ", which is the repository that eventually became the spec text.",
      ),
    ]),
    html.h2([], [html.text("What did we learn?")]),
    html.p([], [html.text("Let's summarise!")]),
    html.ul([], [
      html.li([], [
        html.code([], [html.text("resolve(value)")]),
        html.text(" does not immediately fulfil a promise. It reads"),
        html.text(" "),
        html.code([], [html.text("value.then")]),
        html.text(" first, and if that is a function the promise follows"),
        html.text(" "),
        html.code([], [html.text("value")]),
        html.text(" instead."),
      ]),
      html.li([], [
        html.text(
          "\"Resolved\" is not a state because a resolved promise can still be pending.",
        ),
      ]),
      html.li([], [
        html.text("Reading "),
        html.code([], [html.text("value.then")]),
        html.text(", and reading "),
        html.code([], [html.text("constructor[Symbol.species]")]),
        html.text(" "),
        html.text("inside "),
        html.code([], [html.text("Promise.prototype.then")]),
        html.text(
          ", are ordinary property reads. Getters can throw, and the spec puts whatever they throw on the rejected track.",
        ),
      ]),
      html.li([], [
        html.text(
          "JavaScriptCore did the species read before creating the resolving functions, so when it threw there was nothing to reject with. The fix was to create the functions first and call them when the getter throws.",
        ),
      ]),
      html.li([], [
        html.text(
          "A promise has the shape of a railway, but its failure track can't be labelled, because the engine shares it with you. That is why TypeScript's ",
        ),
        html.code([], [html.text("Promise<T>")]),
        html.text(" "),
        html.text("has no "),
        html.code([], [html.text("E")]),
        html.text(", and why Gleam's "),
        html.code([], [html.text("Promise(value)")]),
        html.text(" has none either."),
      ]),
      html.li([], [
        html.text("Promises flatten because of 2013 thenable interop, so"),
        html.text(" "),
        html.code([], [html.text("Promise<Promise<T>>")]),
        html.text(" can't exist. Gleam works around this with a"),
        html.text(" "),
        html.code([], [html.text("PromiseLayer")]),
        html.text(
          " class that hides the inner promise from the engine's flattening behaviour.",
        ),
      ]),
    ]),
    html.p([], [
      html.text(
        "With the two steps in the right order in JavaScriptCore, Bun 1.4 and Safari 27 now behave like the spec, and like Node:",
      ),
    ]),
    html.figure([a.class("not-prose my-8 md:max-w-[50%]")], [
      terminal.terminal(
        "bun 1.4",
        [
          terminal.Cmd("bun never.mjs"),
          terminal.Out("before"),
          terminal.Out("error: boom"),
          terminal.Dim("exit 1"),
        ],
        running: False,
      ),
    ]),
    html.p([], [html.text("Excellent.")]),
    html.br([]),
    html.p([], [
      html.text(
        "If you read all the way to the end, then I am glad you are as excited about promises as I am. Thank you very much for reading!",
      ),
    ]),
    html.br([]),
    html.div([a.class("text-xs")], [
      html.p([], [
        html.text("Thank you to "),
        external_link.link([a.href("https://x.com/landon_xyz")], [
          html.text("Landon Boles"),
        ]),
        html.text(","),
        html.text(" "),
        external_link.link([a.href("https://x.com/fat")], [
          html.text("Jacob Thornton"),
        ]),
        html.text(" and"),
        html.text(" "),
        external_link.link([a.href("https://x.com/amadeus")], [
          html.text("Amadeus Demarzi"),
        ]),
        html.text(", who all helped me review a draft of this post."),
      ]),
    ]),
  ])
}
