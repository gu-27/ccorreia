# Tax Review Live

Kahoot-style live review games for Individual Income Taxes, Ch. 5 (Exclusions) and Ch. 6 (Deductions and Losses).

- **Students:** go to `ccorreia.pages.dev/games/tax-review-fall2026`, enter the 5-character code and their name, then wait for the host.
- **Host (you):** go to `ccorreia.pages.dev/games/tax-review-fall2026/host`, pick Card Sort, Two Truths & a Lie, or Mix, then pick the number of questions and seconds per question, and click **Create session**. Project the lobby screen, which shows the code and a QR code. Click **Start game** once everyone is in.

Scoring is Kahoot-style: each question starts at 1,000 points and counts down to 0 as the clock runs out (shown live on both screens). A correct answer earns the points showing when it was submitted. Wrong or no answer earns 0. After each question the host screen shows the right answer, how many picked each option, the explanation and the top 5. The game ends with a podium for the top 3, plus confetti and a fanfare. The music and sound effects are original, generated in the browser. Use the ♪ button to mute.

## Layout

| Folder | What it is | Deploys to |
|---|---|---|
| `sessions-worker/` | The live-session engine (one Durable Object per game code). Questions live in `src/questions.js`. | Cloudflare Worker `tax-review-sessions` |
| `site/` | Her site. The game lives in `public/games/tax-review-fall2026/` and `functions/games/tax-review-fall2026/`. The pages students and host see, plus `/api` and `/ws` functions that connect to the engine. | Cloudflare Pages project `ccorreia` |

## Deploy (GitHub-connected)

1. Push this folder to a new GitHub repo named `ccorreia`.
2. **Deploy the Worker first.** In Cloudflare, go to **Workers & Pages → Create → Import a repository**, pick the repo, and set the root directory to `sessions-worker`. Keep the deploy command `npx wrangler deploy`.
3. **Then deploy the site.** Go to **Workers & Pages → Create → Pages → Connect to Git**, pick the same repo, and set:
   - Project name: `ccorreia`
   - Root directory: `site`
   - Build command: *(none)*
   - Output directory: `public`

   `site/wrangler.jsonc` binds `SESSION` to the Worker. If the dashboard doesn't pick that up, add it under **Settings → Bindings → Durable Object**: variable `SESSION`, Worker `tax-review-sessions`, class `Session`. Then redeploy.

From then on, a push to `main` redeploys whichever folder changed.

**Deploying from your machine instead:** run `cd sessions-worker && npm i && npx wrangler deploy`, then `cd ../site && npm i && npx wrangler pages deploy`.

## Editing questions

Edit `sessions-worker/src/questions.js` and push.
- Card Sort rows are `[type, item, answer, why]`. The answer is one of `Taxable`, `Excluded`, `Deductible` or `Not deductible`.
- Two Truths rows are `[topic, [three statements], lieIndex, why]`. The order of the statements is shuffled for each game.

## Local test

Open two terminals:
- `cd sessions-worker && npm i && npx wrangler dev --port 8788`
- `cd site && npm i && npx wrangler pages dev --port 8787`

Then open http://localhost:8787/games/tax-review-fall2026/host.
