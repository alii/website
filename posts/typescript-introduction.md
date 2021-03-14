---
title: "TypeScript Introduction"
excerpt: "Bring static types, an overwhelmingly welcoming community, a massively improved developer experience, modern sugar syntax, decorators and much, much more to JavaScript."
cover: "/covers/xps.jpg"
date: "2020-12-22T10:53:12.000Z"
tags: "typescript, introduction, tutorial, learn, javascript"
author:
    name: Alistair Smith
    avatar: "/authors/alistair.png"
    twitter: aabbccsmith
---

#### This post is a work in progress, and will be updated over time.

This post is totally work in progress, and I will keep updating it in the future. It's primarily made for developers who _already_ have a fairly solid JavaScript understanding. Whilst TypeScript is brilliant, it's not amazing for those just starting out. I would recommend getting a solid grasp on the fundamentals of JS before moving on to an abstraction such as TS.

# Intro

TypeScript brings static types, an overwhelmingly welcoming community, a massively improved developer experience, modern sugar syntax, decorators and much, much more to JavaScript. It does this through an easy-to-learn syntax extension which we will go through today.

## Static Types

Static types allow us as developers to guarantee the type of a variable or argument at runtime. Previously with JavaScript, this was not possible. For example, if we had a function that added two numbers together, we could write this in JavaScript like

```js:add.js
function add(a, b) {
  return a + b;
}

const result = add(10, 20); // => 30
```

Now, this is perfectly fine as long as we always pass this function two numbers, but what if we passed it a string instead?

If we did `add("Hello", 2)`, it would return `"Hello2"`. This is because JavaScript, under the hood, coerces the type of "2" to become a string so that it can be concatenated to the end of `"Hello"`. Phew, that was a mouthful.

The issue here is that this function is only meant to add two numbers together, yet we are able to pass other types of variables, and even worse, it "works."

This is where TypeScript comes into play. With TS, we can write this function as

```typescript
function add(a: number, b: number) {
  return a + b;
}

const resultA = add(10, 20);
const resultB = add("Hello", 2);
```

If you ran that in the [TypeScript playground](https://www.typescriptlang.org/play), you'll notice a line appear under `"Hello"`. It might say something like

```
Argument of type 'string' is not assignable to parameter of type 'number'.(2345)
```

TypeScript is telling us that we, as a developer, cannot give this function a string. It **must** be a number. Now, for a function like `add`ing, this might not be very useful, but in a large team you are able to read code that other developers have written very easily. You can see what a function returns, what parameters it takes, the structure of objects, and much more.

For example, if we had a function like this:

```typescript
function badlyNamedFunctionThatDoesSomethingREALLYComplex(
  userId: string
): Promise<User> {
  // ...
}
```

We are able to see exactly what this function returns (a Promise fulfilled with a User type – we'll come on to those shortly) and what arguments it takes. Imagine if this function did not have these type annotations, and we had to work out by running our code multiple times. TypeScript is shortening the feedback cycle for development; I don't have to leave my IDE to have instant information about if my code will run or not.

## Interfaces & Types

In TypeScript, we can define the **shape** of something with an interface or a type. Types can do more than interfaces, but interfaces are nicer for data structures. Here's an example

```typescript
interface User {
  name: string;
  username: string;
  links: {
    github: string;
  };
}
```

So, you can see here that we have defined an interface called `User` (common practice is to name them with a capital letter, like a class). Now, the "complex" function we wrote above is properly typed, as we have created its return type (`Promise<User>`).

This is useful for development, as when we are typing in an IDE that can understand TypeScript, it will try to autofill properties and methods of this object.

#### So what about types?

Types are a great way to represent data that can be an object, like interfaces, but it also supports doing things inline, too. It's more flexible.

We can define a type as simple as:

```typescript
type UserLinks = {
  github: string;
};
```

Or, do something more complex, like this:

```typescript
// Don't worry about what this does for now.
// We'll come on to it later.
type PartialPick<T, K extends keyof T> = {
  [P in K]?: T[P];
};
```

Whilst it's possible to write a `PartialPick` type with interfaces, it's much harder and less readable, so you can see when and where to use interfaces vs types.

## Generics

In the above codeblock, we use something called Generics. They are in many strongly typed languages, including TypeScript. Whilst they look extremely overwhelming and complex, they can be really easily broken down. I learnt them by thinking of them like a function paramater for this type. For example:

```typescript
//           Create "param"
//           |        Add age
//           |        |        /-- of type `number`
type WithAge<T> = T & { age: number };

type UserWithAge = WithAge<User>;
```

Now, `UserWithAge` is a type that has the same properties we defined above, in `User`, but it also has `age: number`. The reason this is called a generic, is because we can throw anything into it, and it will always add `age` to it.

Commonly people ask me what `T` means in this context. It's half just what "everybody else does" but also half because it stands for <ins>**T**</ins>ype. If we go back to our `PartialPick` example, we can see that we define two "params" which are `T` and `K`. T means "Type" and K means "Key"

However, `K` is not just any key – it's a key that extends the `keyof T`. So, it's a _union_ of all the keys of T.

If we did

```typescript
type MyDemoType = PartialPick<{ name: string; age: number }, ?>;
```

Then, the second "param" (I've left it as `?` for now) we pass to `PartialPick` has to extend `name | age`.

#### But, I hear you ask, what do you mean by extend? What is the `extend` keyword?

Whilst the core TypeScript team have admitted this is not brilliant syntax, the `extend` keyword tells the developer that a type must have the base properties or values specified. Similar to extending a class in JavaScript, you copy the base properties and methods of the class you are extending.

#### And you mentioned "union" – what is that?

A union type is that of two or more types together, for example

```ts:toast.ts
type ToastPositions = "top" | "bottom" | "left" | "right";
```

This is more specific than just `string`, as we can have the individual values that our code can use. On a note about extending, this union type we just defined also _extends_ `string`!

### Well folks

That is all I have time for now, I will keep updating this post as time goes on. Thanks for reading!
