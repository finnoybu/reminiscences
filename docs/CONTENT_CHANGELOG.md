# Content Changelog

Record intentional changes to manuscript content. Update this file any time you modify chapter frontmatter or structure, then regenerate hashes.

## Format

```
## [Version] - YYYY-MM-DD

### Changed
- Description of change to specific chapter(s)
- Reference the chapter slugs affected

### Added
- New chapters or sections

### Fixed
- Corrections to frontmatter or structure

### Hash Update
- Regenerated on: YYYY-MM-DD HH:MM:SS by [whoever]
```

## Entries

### [v0.0.2] - 2026-03-03

#### Added
- Initial ingestion of 69 chapters from manuscript.zip
- Frontmatter standardization: all chapters now have id, title, slug, hero.image  

#### Hash Baseline
- Generated on: 2026-03-03 17:22:02 UTC
- Content baseline established post-ingestion
- 69 MD5 hashes captured for content integrity verification

---

## Regenerating Hashes

When you modify chapter content or frontmatter intentionally:

```bash
# Document your changes here in this file
# Then regenerate:
pnpm run hash:content

# CI will verify on next commit:
pnpm run hash:verify
```

**Important**: Do NOT modify chapter body text without documenting it here first.
