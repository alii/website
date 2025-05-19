# 🦄 alii/website

> The personal site, blog, and playground of [Alistair](https://alistair.sh) — powered by Next.js, Bun, and a sprinkle of TypeScript wizardry. This repo is a meme, a portfolio, and a tech playground all in one.

---

## 🧪 Notable Folders

- `src/pages/experiments/` — Fun stuff (morphing shapes, rekordbox parser, etc)
- `src/pages/monzo/dashboard/` — Monzo API dashboard
- `src/pages/api/` — API endpoints (OAuth, OG images, posts, etc)
- `src/components/` — Blog UI, message bubbles, notes, etc
- `src/blog/` — All blog posts (see above)

---

## 🛠️ Running Locally

1. **Install [Bun](https://bun.sh/):**
   ```sh
   curl -fsSL https://bun.sh/install | bash
   ```
2. **Install dependencies:**
   ```sh
   bun install
   ```
3. **Read [src/server/env.ts](./src/server/env.ts), then create a `.env` file**
4. **Run the dev server:**
   ```sh
   bun run dev
   ```
5. **Visit** [http://localhost:3000](http://localhost:3000)

---

## 📝 License

[Apache 2.0](./LICENSE) — meme responsibly.

---

## 🦾 Contributing

PRs welcome if you're cool. Open an issue or ping [@alistaiir](https://twitter.com/alistaiir) if you break something.

---

## 💬 FAQ

- **Why TypeScript for blog posts?**
  - Because markdown is too mainstream and writing JSX is literally closer to the output result
- **Why Bun?**
  - It's fast bro
- **Why is this repo so extra?**
  - Why not
