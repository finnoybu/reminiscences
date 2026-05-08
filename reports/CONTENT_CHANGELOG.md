# Content Changelog

## v0.1.7 (2026-05-08)

### Spelling corrections from print.docx
- 198 word-level spelling fixes propagated from the corrected `output/a-sailors-reminiscences-print.docx` back to source markdown across 23 chapters in `content/en/`.
- 1 hand correction in `a-perilous-adventure.md` (`aggreable` → `agreeable`); a Word-autocorrect-introduced misspelling (`aggregable`) was excluded from the bulk-apply and resolved manually.
- Markdown links, italics, and straight typography preserved; Word's autocorrect noise (curly quotes, NBSP, em-dashes) was filtered out so only letter-level edits landed in source.
- `node scripts/hash-content.mjs` regenerated `reports/content_hashes.sha256` against the corrected tree.

## v0.1.6 (2026-04-23)

### Rehash after typo-only edit
- PR #78 fixed a single typo in `content/en/coming-home.md` without regenerating `reports/content_hashes.sha256`, which caused content-validate to fail on every subsequent PR with "Hash mismatch: content/en/coming-home.md".
- No manuscript body changes intended in this patch beyond the already-landed typo; this entry records the hash regeneration to re-baseline the integrity check.
- `node scripts/hash-content.mjs` regenerated `reports/content_hashes.sha256` against the current `content/en/` tree.

## v0.1.1 (2026-03-03)

### Hashing Policy Update (Determinism + Metadata Tolerance)
- Changed hashing scope to **hash markdown body only** (frontmatter excluded)
- Normalized line endings during hashing for cross-platform determinism (Windows/Linux)
- Regenerated SHA256 baseline hashes
- No manuscript prose/body changes were made intentionally; only frontmatter was auto-corrected earlier during ingestion

## v0.0.5 (2026-03-03)

### Initial Manuscript Ingestion
- Ingested 69 chapters from primary manuscript source
- Generated initial SHA256 content hashes for integrity verification
- All content files validated for required frontmatter fields

### Content Integrity Baseline
- Locked SHA256 hashes to prevent unintended modifications
- Enabled automated drift detection in CI pipeline
- Hash updates to be done intentionally with changelog updates

All markdown files locked as of this commit. Future modifications require explicit changelog entries.
