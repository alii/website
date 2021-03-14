---
title: "node-fetch with proxies"
excerpt: "A small guide on using node-fetch with HTTP Proxies in Node.js"
cover: "/covers/network-tower.jpg"
date: "2020-12-22T10:55:12.000Z"
tags: "node.js, node, typescript, javascript, proxies, sneaker bot, sneakers, aio bot, http proxies, proxy agent, react, node-fetch, fetch"
author:
    name: Alistair Smith
    avatar: "/authors/alistair.png"
    twitter: aabbccsmith
---

# Using node-fetch with HTTP Proxies

It's fairly easy to add proxies to node-fetch, but it took me a while to figure out the best way. After a couple of hours scrolling through GitHub, trying a plethora of different methods, I concluded that the following code is the best method to do it.

```shell
yarn add node-fetch http-proxy-agent

# And, if you use TypeScript
yarn add @types/node-fetch @types/http-proxy-agent -D
```

```typescript:fetch.ts
import { HttpProxyAgent } from "http-proxy-agent";
import fetch, { RequestInit } from "node-fetch";

function fetchWithProxy(url: string, proxy: string, init?: RequestInit) {
  const agent = new HttpProxyAgent(proxy);
  return fetch(url, { agent, ...(init ?? {}) });
}

fetchWithProxy(
  "https://httpbin.org/post",
  "http://username:password@example.com:port",
  { method: "POST" }
).then((res) => console.log(res.statusText));
```

As written above, the format for the proxy must be `http://username:password@host:port`. This works great from my testing and means you don't have to use other deprecated libraries, like [request](https://www.npmjs.com/package/request).

Hope this small code snippet helps!
