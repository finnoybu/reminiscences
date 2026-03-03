# Tooling and Development Environment

## Package Manager

We use **pnpm** for dependency management across this project.

### Why pnpm?
- **Monorepo support**: Built-in workspaces for multi-package projects
- **Disk efficiency**: Shared store reduces duplication  
- **Speed**: Faster installation than npm/yarn
- **Strict dependencies**: Prevents phantom dependencies

### Installation

```bash
npm install -g pnpm
```

### Basic Commands

```bash
pnpm install        # Install dependencies
pnpm add <pkg>      # Add a package
pnpm add -D <pkg>   # Add a dev dependency
pnpm install -r     # Install across all workspaces
pnpm run <script>   # Run a script
```

## Node.js Version Policy

- **Minimum**: Node.js 18 LTS
- **Recommended**: Node.js 20 LTS (current)
- **Maximum**: Latest stable

### Version Management

Use `.nvmrc` to specify the target version for `nvm`:

```bash
nvm install
nvm use
```

Or use `fnm`, `asdf`, or `volta` for version management.

## TypeScript

- Strict mode enabled
- ESNext targets
- Strict null checks
- No implicit any

## Testing

- Framework: [Configured in package.json]
- Minimum coverage: [To be configured]

## Linting & Code Style

- Linter: ESLint
- Formatter: Prettier
- Pre-commit hooks: [To be configured with Husky]
