# casino-originals

Frontend-only originals games demo (Next.js + Storybook). No backend or websocket.

## App (Vercel-ready)

```bash
pnpm dev
pnpm build
pnpm start
```

- `/` redirects to `/games/coinflip`
- `/games/coinflip` — live Coinflip with header + sidebar
- other `/games/*` routes show a coming-soon placeholder

Deploy to Vercel: import this repo, framework preset **Next.js**, build command `pnpm build`, output detected automatically.

## Storybook

```bash
pnpm storybook
```
