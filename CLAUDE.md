# CLAUDE.md — reminiscences

Registry of authority documents, hard rules, and pointers. Low-drift by design. Prefer linking over restating.

## What this repo is
Next.js 14 (App Router) reader platform serving a 70-chapter English manuscript — a Norwegian sailor's memoir — from [content/en/](content/en/). Server-rendered markdown via `gray-matter` + `marked`. Owned by Finnoybu; repo at `github.com/finnoybu/reminiscences` (formerly `sea-reader`).

## Authority (in order)
1. [GOVERNANCE_CHARTER.md](GOVERNANCE_CHARTER.md) — policy
2. [COPILOT_MASTER_INDEX.yaml](COPILOT_MASTER_INDEX.yaml) — execution contract (v0.0.x bootstrap stages)
3. [docs/](docs/) — operational policies (branch, release, security, a11y, perf, DR, rollback, observability, env, rate limiting)
4. `templates/**` and `schemas/` — reference artifacts ([schemas/frontmatter.schema.json](schemas/frontmatter.schema.json))

If a rule here conflicts with the Charter, the Charter wins. Update this file rather than diverge.

## Hard rules
- **Manuscript integrity**: never modify markdown body text under [content/en/](content/en/) via automation. Allowed automated edits are limited to frontmatter repair per [GOVERNANCE_CHARTER.md](GOVERNANCE_CHARTER.md#manuscript-integrity). Prose rewrites, editorial changes, and new narrative content are disallowed.
- **SemVer lanes**: v0.0.x = infrastructure/governance/content; v0.1.x+ = application. See [docs/BRANCH_POLICY.md](docs/BRANCH_POLICY.md).
- **Branching**: `feature/vX.Y.Z-<kebab>` or `patch/vX.Y.Z_PATCH-<kebab>`. Annotated tag on main matching target version must exist before branching.
- **Merge**: PR required, 1 approval, required checks green, signed commits, linear history, no force-push. Enforced via GitHub Rulesets (applied by [scripts/apply-rulesets.sh](scripts/apply-rulesets.sh)).
- **Conventional commits**: see [docs/CONVENTIONAL_COMMITS.md](docs/CONVENTIONAL_COMMITS.md).
- **Content hashing**: SHA256 inventory is verified in CI — run [scripts/hash-content.mjs](scripts/hash-content.mjs) after intentional content changes.

## Layout
- [app/](app/) — Next.js routes. Entry [app/page.tsx](app/page.tsx), chapter view [app/chapters/\[slug\]/](app/chapters/[slug]/), API routes [app/api/chapters/](app/api/chapters/) and [app/api/search/](app/api/search/).
- [components/](components/) — `ReaderShell`, `ReaderSettings`, `ReadingProgress(Tracker)`, `SearchBar`, `Hero`, `Geo`, `AnnotationPlaceholder`.
- [lib/chapters.ts](lib/chapters.ts) — chapter loading, slug lookup, adjacency. Source of truth for chapter metadata shape.
- [lib/reader-context.tsx](lib/reader-context.tsx) — reader preferences + progress state.
- [lib/search.ts](lib/search.ts) — full-text search.
- [content/en/](content/en/) — manuscript (70 chapters + [introduction.md](content/en/introduction.md)). Each file has frontmatter: `title`, `id`, `slug`, `hero.image`.
- [scripts/](scripts/) — validation (frontmatter, versioning, content hashes), ingestion, ruleset application.
- [schemas/frontmatter.schema.json](schemas/frontmatter.schema.json) — frontmatter contract.

## Commands
- `pnpm dev` — local Next dev server
- `pnpm build` / `pnpm start`
- `pnpm lint` / `pnpm typecheck`
- `pnpm validate:versioning` — branch/tag discipline
- `pnpm validate:frontmatter` — schema check across [content/en/](content/en/)
- `pnpm validate:content-hashes` — verify manuscript SHA256 inventory

Node 24.x, pnpm 9.

## Related context (external)
- Parent brand/IP: Finnoybu. Sibling repo: `d:/dev/finnoybu-press-deploy`.
- Reminiscences is **not** part of the AEGIS Initiative (`d:/dev/AEGIS Initiative/`). Don't import AEGIS-specific concepts (ADRs, RFCs, GFN/AGP) here.
