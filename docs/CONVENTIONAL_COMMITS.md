# Conventional Commits

This project adheres to the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages.

## Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (formatting, missing semicolons, etc.)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build system or external dependencies
- **ci**: Changes to CI configuration
- **revert**: Reverts a previous commit

## Scope

The scope should specify what part of the codebase is affected:
- `content`: Manuscript content changes
- `schema`: Data schema changes
- `ci`: CI/CD pipeline
- `docs`: Documentation
- `deps`: Dependencies

## Examples

```
feat(content): add chapter 42

fix(schema): correct frontmatter validation for null fields

docs: update installation instructions

chore(deps): upgrade eslint to v9.0.0

ci: add CodeQL scanning workflow
```

## Breaking Changes

If a commit introduces a breaking change, add `BREAKING CHANGE:` footer:

```
feat(schema)!: restructure frontmatter required fields

BREAKING CHANGE: hero.image is now required for all chapters
```

Or use `!` after the scope to indicate breaking change.

## Commit Best Practices

- Use imperative mood ("add feature" not "added feature")
- Don't capitalize the first letter
- No period (.) at the end
- Limit the first line to 50 characters
- Reference issues when applicable: "fixes #123"
- Keep commits atomic and logically grouped
