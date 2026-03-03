# Sea Reader Governance Charter

Generated: 2026-03-03

## Purpose
Define a deterministic, mostly automated process to bootstrap infrastructure and ingest manuscript markdown using GitHub Rulesets (not legacy branch protection).

## Authority Layers
1. This Charter (policy)
2. `instructions/*.yaml` (execution)
3. `templates/**` (reference artifacts)

## SemVer
- v0.0.x = infrastructure + governance + content ingestion
- v0.1.x+ = application implementation

## Branching
- Feature: `feature/vX.Y.Z-<kebab-description>`
- Patch: `patch/vX.Y.Z_PATCH-<kebab-description>`

## Tagging
Before starting ANY feature or patch branch:
- Create annotated tag on main matching the target version (e.g. `v0.0.4`).

## Merge Rules
- PR required
- 1 approval minimum
- Required checks must pass
- Signed commits required
- Linear history required
- Force-push and deletion disabled
- Implemented via GitHub Rulesets

## Validation Contract
After each merge to main:
- Run full CI on main
- Run targeted regressions for affected components
- Any defect triggers PATCH branch + repeat validation

## Manuscript Integrity
- Markdown body text MUST NOT be modified by automation.
- Allowed automated edits:
  - add/repair YAML frontmatter when derivable mechanically
  - fix invalid YAML syntax
  - fill missing required fields with placeholders
- Disallowed:
  - rewriting prose
  - editorial changes
  - injecting new narrative content

## Rulesets as Code
- Rulesets MUST be applied via GitHub REST API (`/repos/{owner}/{repo}/rulesets`) using JSON payloads stored in `templates/github/rulesets/`.
