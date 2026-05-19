# Cloudflare Pages setup — memoirs.finnoybu.com

Bootstrap checklist for connecting `D:\dev\reminiscences` (this repo) to a
Cloudflare Pages project that serves `memoirs.finnoybu.com`. Run this once,
top-to-bottom. After it is done, deploys are git-triggered on push.

The migration sources, the foundation commits, and the rationale for every
"why this way" decision live in the memoirs migration handoff memory at
`D:\dev\claude-memory\memory\project_memoirs_migration_handoff.md`. Reach
for the general migration playbook at
`reference_finnoybu_site_migration_playbook.md` if a step here is unclear —
that file is the proven recipe used to ship `press.finnoybu.org` and
`fiction.finnoybu.com`. This doc only covers memoirs-specific deltas.

> **Status before this checklist runs:** branch `migration/astro-cf` is
> pushed to `origin`. `npx astro check` and `npm run build` are clean.
> Production at memoirs.finnoybu.com still serves the Next.js + Supabase
> stack from `main`. Nothing here touches that until step 10.

## 1. Create the Cloudflare Pages project

- CF dashboard → Workers & Pages → Create application → Pages → Connect to Git
- Repository: `finnoybu/reminiscences`
- Production branch: `migration/astro-cf` (you'll switch to `main` after step 10)
- Build command: `npm run build`
- Build output: `dist`
- Framework preset: Astro (the dashboard will fill these in if you pick this)

Project name will be `reminiscences` to match `wrangler.toml`. The preview
hostname will be `reminiscences.pages.dev`.

## 2. Add bindings

Pages → reminiscences → Settings → Bindings. Add BOTH environments
(Production + Preview), even though wrangler.toml declares them — Pages
re-asks for them at the dashboard layer.

- **D1**: variable name `DB`, database `finnoybu-trilogy`
  (`database_id = 954d7506-aea2-4900-8f84-07f227466e59`). This is the **shared**
  database with fiction.finnoybu.com. Memoirs writes purchase rows with
  `productId='pdf-epub'`; fiction uses `'salt-and-silence'`. The schema is
  authored in `finnoybu-trilogy/src/db/schema.ts` — do not edit it from here.
- **R2**: variable name `FILES`, bucket `reminiscences-files`.
  Create the bucket first: CF dashboard → R2 → Create bucket → name
  `reminiscences-files`. If R2 is not enabled for the account yet, do the
  one-time enablement at R2 → "Enable R2" first.

## 3. Environment variables

Pages → reminiscences → Settings → Variables and Secrets. **Add each one
under both Production and Preview separately** — the dashboard form silently
defaults to Preview only, and Production visits will see `authConfigured:false`
until you fix it. This bit press.finnoybu.org during its rollout; see
`feedback_cf_pages_env_per_environment.md`.

Plaintext vars come from `wrangler.toml` and only need to be re-entered in
the dashboard if you skip Wrangler-managed config. For clarity the secrets
are the only ones that *must* be entered by hand:

| Variable                | Production            | Preview               | Notes                                                                 |
|-------------------------|-----------------------|-----------------------|-----------------------------------------------------------------------|
| `BETTER_AUTH_SECRET`    | (secret)              | (secret)              | **Must equal fiction's value.** Copy from the fiction Pages dashboard so `.finnoybu.com` cookies stay valid across both subdomains. |
| `STRIPE_SECRET_KEY`     | (secret)              | (secret)              | Reuse fiction's. Stripe's secret key is account-scoped, not per-endpoint. |
| `STRIPE_WEBHOOK_SECRET` | (new value)           | (new value)           | **Memoirs gets its own webhook signing secret** — Stripe issues a fresh secret per endpoint, and we'll add a new endpoint in step 8. |
| `AWS_ACCESS_KEY_ID`     | (secret)              | (secret)              | Same IAM user as fiction. Apex `finnoybu.com` is already SES-verified, which covers `hello@memoirs.finnoybu.com` automatically. |
| `AWS_SECRET_ACCESS_KEY` | (secret)              | (secret)              | Same as above.                                                        |
| `GOOGLE_CLIENT_SECRET`  | (secret)              | (secret)              | Same Google OAuth client as fiction. Add memoirs's callback URL to the existing Google client: `https://memoirs.finnoybu.com/api/auth/callback/google`. |
| `FACEBOOK_CLIENT_SECRET`| (secret)              | (secret)              | Same Facebook app as fiction. Add memoirs's callback URL similarly.   |
| `APPLE_CLIENT_SECRET`   | **DEFER**             | **DEFER**             | Apple Developer enrollment is pending — skip this row at cutover; `auth.ts:55` only registers the Apple provider when both ID + secret are present, so missing secret is harmless. Add when enrollment completes. |
| `GITHUB_CLIENT_ID`      | (new — see step 4)    | (new — see step 4)    | **Memoirs needs its own GitHub OAuth app.** Despite GitHub docs' "subdomain swap allowed" example, in practice GitHub rejects redirect_uris from a different subdomain than the registered callback. Confirmed at cutover (2026-05-19) — sign-in failed with "redirect_uri not associated" until we created a memoirs-only app. Memoirs's CLIENT_ID lives in `wrangler.toml`; the SECRET lives here. |
| `GITHUB_CLIENT_SECRET`  | (new — see step 4)    | (new — see step 4)    | Generated alongside the memoirs-specific GitHub OAuth app in step 4.  |

Anything not listed in the table above (e.g. `PUBLIC_SITE_URL`, `COOKIE_DOMAIN`,
`AWS_REGION`, `EMAIL_FROM`, `GOOGLE_CLIENT_ID`, `FACEBOOK_CLIENT_ID`,
`APPLE_CLIENT_ID`) is already set per environment in `wrangler.toml`.

## 4. Create the memoirs-only GitHub OAuth app

GitHub → Settings → Developer settings → OAuth Apps → New OAuth App:

- Application name: `memoirs.finnoybu.com`
- Homepage URL: `https://memoirs.finnoybu.com`
- Authorization callback URL: `https://memoirs.finnoybu.com/api/auth/callback/github`

After creating it, copy Client ID + generate a new Client Secret. Put both
into the Pages dashboard under Production AND Preview.

(For Google/Facebook/Apple, you do NOT need separate apps — they accept
multiple callback URLs per client. Just add memoirs's callback to the existing
fiction app.)

## 5. Upload digital files to R2

The shop sells one direct-download SKU, `pdf-epub`. The download endpoint
`src/pages/api/download/[slug].ts` builds the key as `${slug}/${slug}.${ext}`
(slug-prefixed path, not flat), so the bucket needs both file variants at
the right keys.

Source files for memoirs live at `D:\dev\reminiscences\output\` (the repo's
own build output dir, not under FINNOYBU Press — memoirs has a different
production pipeline than the AI guidebook series).

```sh
npx wrangler r2 object put "reminiscences-files/pdf-epub/pdf-epub.pdf"  --file="D:/dev/reminiscences/output/a-sailors-reminiscences.pdf"
npx wrangler r2 object put "reminiscences-files/pdf-epub/pdf-epub.epub" --file="D:/dev/reminiscences/output/a-sailors-reminiscences.epub"
```

Notes:

- Wrangler 3.x defaults to remote storage. The `--remote` flag was added in
  wrangler 4 — do NOT include it on v3 or the command errors with
  "Unknown argument: remote". The playbook pins wrangler to `^3.95.0`.
- Use `npx wrangler` rather than a globally-installed `wrangler` to match
  the project's pinned version from `devDependencies`.

## 6. Stripe webhook endpoint

Stripe Dashboard → Developers → Webhooks → Add endpoint:

- URL: `https://memoirs.finnoybu.com/api/webhook` (start with the
  `*.pages.dev` URL if memoirs.finnoybu.com is not pointing at Pages yet;
  swap to the canonical host in step 10).
- Events: `checkout.session.completed`. The handler only acts on this event.
- API version: latest.

Stripe will display the signing secret exactly once. Put it into the Pages
dashboard as `STRIPE_WEBHOOK_SECRET` for Production AND Preview. Workers
runtime has no Node `crypto`, so the handler uses `constructEventAsync`
(per `reference_finnoybu_site_migration_playbook.md`) — no code change needed.

## 7. AWS SES — already done

The apex `finnoybu.com` was domain-verified during the press.finnoybu.org
migration. Memoirs's `hello@memoirs.finnoybu.com` sender is covered by that
verification — no new DKIM CNAMEs to add. If for any reason the SES console
shows the apex as unverified, see step 10 of the migration playbook.

## 8. Smoke-test on the .pages.dev hash

Wait for the build of `migration/astro-cf` to finish. Visit
`https://reminiscences.pages.dev`:

- Homepage renders with the memoirs hero, ReadingProgress card is hidden
  (no localStorage yet), chapter grid shows all chapters.
- Open a chapter — ChapterScrubber appears on desktop right edge after a bit
  of scrolling; PromoModal does NOT fire (not enough chapters visited yet).
- Sign in with magic link — WelcomeModal pops up once.
- Search via the homepage SearchBar — results return.
- /shop loads, "Buy now" → Stripe Checkout (use a test card). Success
  redirects to /shop/success and the PDF/ePub tiles flip to "Get PDF" / "Get
  ePub" on /shop after a refresh.

If any of these fail, do NOT proceed to DNS cutover.

## 9. Add the custom domain

Pages → reminiscences → Custom domains → Set up a custom domain:
`memoirs.finnoybu.com`. With DNS already on Cloudflare (finnoybu.com is
managed there), the CNAME + Universal SSL auto-provision in under a minute.

If `memoirs.finnoybu.com` currently has a CNAME pointing at Vercel, remove
it first.

## 10. Switch the production branch and cut over

Two final flips:

1. Update `PUBLIC_SITE_URL` in the Pages dashboard if step 1 used the
   `.pages.dev` URL. The wrangler.toml value `https://memoirs.finnoybu.com`
   is correct, so dashboard-side changes only matter if you overrode it.
2. Stripe webhook URL → swap to `https://memoirs.finnoybu.com/api/webhook`
   if it was set to the .pages.dev URL earlier.
3. Merge `migration/astro-cf` → `main` in the repo, then in the Pages
   dashboard change Production branch to `main`. Don't push and switch
   simultaneously — wait for the migration-branch deploy to settle, then
   merge, then switch.

## 11. Decommission

Wait several days of clean prod traffic before destructive actions, and
**do not** disable the shared `.com` Supabase project until fiction is
also off it. Memoirs and fiction share that Supabase. See step 16 of the
migration playbook.

The Vercel project for memoirs can be paused right after step 10; deletion
is fine after a week of stable Pages traffic.

## Common stumbles

- **`authConfigured:false` on the production hostname** but auth works on
  preview — env vars were added under Preview only, not Production.
  See `feedback_cf_pages_env_per_environment.md`.
- **Stripe webhook returns 400** — wrong `STRIPE_WEBHOOK_SECRET`. Each
  endpoint has its own; do not paste fiction's. Also verify the handler
  uses `constructEventAsync` not `constructEvent` (it already does).
- **Sign-in cookies don't persist across the two sites** —
  `BETTER_AUTH_SECRET` differs between memoirs and fiction, OR `COOKIE_DOMAIN`
  is not `.finnoybu.com` (wrangler.toml already sets this for production;
  preview intentionally leaves it empty).
- **403 on a /api/download/pdf-epub request** — the user's `purchases.productId`
  doesn't match what the endpoint queries. Legacy Next.js memoirs rows are
  already `'pdf-epub'`, so don't rename.
- **`npm ci` fails on Cloudflare's build** — `package-lock.json` was
  regenerated under Windows, which strips Linux platform binaries. Re-run
  the regenerate-via-WSL step (`npm run lock:wsl`). See
  `feedback_windows_npm_lockfile.md`.

## Pitfalls discovered during memoirs cutover (2026-05-19)

These bit during the actual migration and are worth knowing about up front
for any future port:

- **`tailwind.config.ts` is mandatory** — without it, Tailwind defaults to
  `content: []` and emits only the base layer (CSS reset + custom
  properties), giving an unstyled site. Port fiction's config but change
  the content glob to `./src/**/*.{astro,html,ts,tsx}`.
- **Don't blindly copy fiction's `src/styles/global.css`** — fiction's
  Sea-Fog palette (`#e8ecee` cool slate-blue-grey) bleeds into memoirs
  unless you replace the design tokens with memoirs's Parchment palette
  (`#f6f1e4` warm cream, `#1a1611` warm dark brown, `#a8763e` brass).
  The source of truth is on the pre-migration `main` branch at
  `app/globals.css`.
- **Image grayscale treatment differs** — fiction uses
  `grayscale sepia-[.15]` for a slight warm tint on chapter cards/heroes;
  memoirs uses pure `grayscale` (no sepia). Check `src/components/Chapter*.astro`
  and `src/pages/{about,index}.astro` after porting.
- **Better Auth `baseURL = ctx.url.origin`** — see [`src/pages/api/auth/[...all].ts`](../src/pages/api/auth/%5B...all%5D.ts).
  The handler uses the request origin, NOT `PUBLIC_SITE_URL`. Consequence:
  smoke-testing OAuth on `*.pages.dev` requires registering that hostname
  with each provider's redirect-URI list. Easier to just do the DNS cutover
  first and smoke-test on the canonical domain.
- **GitHub OAuth Apps don't actually permit cross-subdomain redirects** —
  the docs' "subdomain swap allowed" example is misleading. Confirmed at
  cutover: a fiction OAuth app rejected the memoirs callback with
  "redirect_uri is not associated with this application." Always create a
  per-subdomain OAuth app for GitHub (one app per site).
- **CI workflow needs Astro/npm refit** — `.github/workflows/ci.yml` was
  originally written for pnpm + Next.js. After migration: switch to
  `npm ci`, drop the lint/test jobs (no scripts exist for them yet), and
  drop Next.js-era env vars in the build step. Also add `migration/*` to
  `scripts/validate-versioning.mjs` if you're using that branch name pattern.
- **`scripts/validate-frontmatter.mjs` needs `gray-matter` + `ajv`** —
  these were Next.js runtime deps in the old codebase; Astro doesn't need
  them at runtime but the validation script imports them. Add to
  `devDependencies` and regen the lockfile via WSL.
- **Direct push to `main` is blocked by repository ruleset** — even with
  `--admin`, the "Changes must be made through a pull request" rule applies.
  To trigger a Production build of `main` without committing through a PR,
  use `npx wrangler pages deploy ./dist --project-name reminiscences --branch main`.
- **CodeQL flags `String.replace(/<[^>]*>/g, '')` as incomplete
  sanitization** — for excerpts, prefer the stricter `replace(/[<>]/g, '')`
  which is provably incapable of leaving any angle brackets in the output.
