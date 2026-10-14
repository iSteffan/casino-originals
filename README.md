# Casino Originals

A frontend-only demo of in-house casino originals: nine playable games in one Next.js app, with a shared wallet, autobet, theatre mode, and Storybook for the UI.

There is no backend, authentication, or websocket. Outcomes are resolved locally so you can exercise the full player shell — betting, payouts, sounds, and layout — without a live wagering stack.

---

## Games

Every title is available in the app sidebar at `/games/<id>`. Shared across most games: demo wallet and cashier, manual / autobet modes, stop conditions, volume, theatre layout, and a win overlay.

| Game | Route | What it is | What you can do |
| --- | --- | --- | --- |
| **Mines** | `/games/mines` | Grid of tiles with hidden mines | Choose grid size and mine count, pick tiles, cash out, or hit a mine |
| **Towers** | `/games/towers` | Climb a tower, row by row | Pick a safe cell per floor, advance, cash out, or hit a bomb |
| **Dice** | `/games/dice` | Roll against a target | Set roll under/over, target, win chance, and multiplier; watch the cube settle |
| **Keno** | `/games/keno` | Draw 10 numbers from 40 | Pick up to 10 spots (or auto-pick), choose risk, and match the draw |
| **Coin Flip** | `/games/coinflip` | Heads or tails | Pick a side, optional turbo, and play the coin animation |
| **Blackjack** | `/games/blackjack` | Standard table blackjack | Deal, hit, stand, double, split, and insurance against a local dealer |
| **Roulette** | `/games/roulette` | European-style wheel | Place inside/outside bets, spin, and settle from the wheel result |
| **Plinko** | `/games/plinko` | Ball drop through pins | Choose risk and row count, optional turbo, drop balls into multiplier buckets |
| **Double** | `/games/double` | Color / joker strip | Pick red, black, or joker on a scrolling strip and settle the round |

The home page (`/`) redirects to Coin Flip.

---

## Run locally

Requires [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev
```

App: [http://localhost:3000](http://localhost:3000)

```bash
pnpm storybook
```

Storybook: [http://localhost:6006](http://localhost:6006) — isolated boards, configs, and composition stories.

```bash
pnpm build
pnpm start
```

Production build. On Vercel, import the repo with the **Next.js** preset; the default `pnpm build` command is enough.

---

## Stack

| Layer | Tools |
| --- | --- |
| App | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4, design-system tokens |
| UI | Radix primitives, Framer Motion, Embla Carousel |
| Money | `bignumber.js` demo wallet (no real funds) |
| Audio | Howler / HTML audio, per-game cues and a shared win-modal sound |
| Docs / isolation | Storybook 10 (`@storybook/nextjs-vite`) |
