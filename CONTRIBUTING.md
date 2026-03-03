# Contributing to Sea Reader

Thank you for your interest in contributing to the Sea Reader project!

## Getting Started

1. **Fork & Clone**: Fork this repository and clone your fork locally.
2. **Install**: Run `pnpm install` to install all dependencies.
3. **Branch**: Create a feature branch: `git checkout -b feature/v0.0.X-description`

## Code Conventions

### Commits

We follow [Conventional Commits](docs/CONVENTIONAL_COMMITS.md) for commit messages. Each commit message should:
- Start with a type (`feat`, `fix`, `docs`, etc.)
- Include a descriptive message
- Reference related issues

Example:
```bash
git commit -m "feat(content): add chapter 42 validation"
```

### Branch Naming

Branches are named following SemVer conventions:
- Feature branches: `feature/vX.Y.Z-kebab-description`
- Patch branches: `patch/vX.Y.Z_PATCH-kebab-description`

For example:
- `feature/v0.0.3-quality-enforcement`
- `patch/v0.0.2_PATCH-schema-fix`

### Pull Requests

1. **Title**: Use the same format as commit messages
2. **Description**: Clearly explain what changes and why
3. **Tests**: Ensure all tests pass locally before submitting
4. **Checks**: Address any CI failures

## Manuscript Content Guidelines

### Frontmatter Requirements

Every chapter must have:
- `id`: Unique integer identifier (>= 0)
- `title`: Chapter title
- `slug`: URL-friendly identifier (kebab-case)
- `hero.image`: Path to hero image

Example:
```yaml
---
id: 1
title: "Chapter Title"
slug: "chapter-title"
hero:
  image: "/images/hero.jpg"
---
```

### Content Integrity

- **DO NOT** modify manuscript body text automatically
- Only update frontmatter when necessary
- Run validation: `pnpm run validate:content`
- Generate content hashes: `pnpm run hash:content`

## Running Tests & Validation

```bash
# Validate content frontmatter
pnpm run validate:content

# Check branch naming
pnpm run validate:versioning

# Generate content hashes
pnpm run hash:content
```

## Development Setup

See [TOOLING.md](docs/TOOLING.md) for detailed development environment requirements.

### Recommended Tools

- **Editor**: VS Code with ESLint + Prettier extensions
- **Git client**: Any; CLI, Sourcetree, or GitKraken all work
- **Node version manager**: nvm, fnm, or asdf

## Questions?

- Check [GOVERNANCE_CHARTER.md](GOVERNANCE_CHARTER.md) for project governance
- Review [COPILOT_MASTER_INDEX.yaml](COPILOT_MASTER_INDEX.yaml) for infrastructure phases
- Open an issue for questions or suggestions

## Code of Conduct

Please be respectful and constructive in all interactions.
