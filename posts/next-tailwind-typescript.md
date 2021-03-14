---
title: "Next.js with Tailwind & TS"
excerpt: "Setting up tailwind with Next.js & TypeScript can seem intimidating, but it's a fairly straightforward process once you have it all simplified."
cover: "/covers/canvas.jpg"
date: "2020-12-28T03:49:19.000Z"
tags: "node.js, node, typescript, javascript, css, tailwindcss, stylesheets, react"
author:
    name: Alistair Smith
    avatar: "/assets/authors/alistair.png"
    twitter: aabbccsmith
---

# Intro

### There a [Repo](https://github.com/alii/next-tailwind-ts) with a template pre-made.

Setting up tailwind with Next.js & TypeScript can seem intimidating, but it's a fairly straightforward process once you have it all simplified.

## Prerequisites

yarn (or npm), Node.js 12+

## App Setup

Firstly, we're going to setup our Next app & deps. This is as simple as running the following four commands

```shell
yarn create next-app my-app
cd my-app
touch tsconfig.json
yarn add typescript @types/node @types/react --dev
```

After this, you can rename the files under `pages/` to end with `.tsx`, and the file under `pages/api/` to `hello.ts` (although you can also delete it if you don't plan on using Now Functions.

When you start your app for the first time by running `yarn dev`, Next.js will populate your `tsconfig.json`, so you can leave it empty for now.

Finally, you can remove the `styles` folder, and change the import in `_app.tsx` to be `import "tailwindcss/tailwind.css"` instead. Remember to remove the import in `index.tsx` too.

## Adding Tailwind

We need to install and setup tailwind and it's dependencies. We can do this by running these commands

```shell
yarn add tailwindcss@latest postcss@latest autoprefixer@latest --dev
npx tailwindcss init -p
```

This will create a `tailwind.config.js` as well as `postcss.config.js`. If you head to `tailwind.config.js`, we need to edit the value of `purge` to include our TypeScript content. This can be done by setting it to

```js:tailwind.config.js
module.exports = {
  purge: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
```

And finally, our app is ready to start.

Thanks for reading my guide!
