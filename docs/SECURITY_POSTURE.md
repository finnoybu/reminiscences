# Security Scanning and Dependency Management

## Overview
Sea Reader implements defense-in-depth security scanning through GitHub's native security tools and automated dependency management.

## Security Tools Enabled

### 1. GitHub Secret Scanning
**Status**: Enabled for public repository  
**Coverage**: Detects secrets, API keys, tokens  
**Protection Level**: Push protection blocks commits with detected secrets  
**Remediation**: Secret scanning alerts reviewed immediately

### 2. CodeQL Analysis
**Status**: Enabled  
**Trigger**: On all pushes and pull requests  
**Workflow**: `.github/workflows/codeql.yml`  
**Languages Scanned**: JavaScript/TypeScript  
**Check Name**: `analyze (javascript-typescript)`  
**Configuration**: Default CodeQL queries (SEMMLE)

### 3. Dependabot
**Status**: Enabled  
**Configuration**: `.github/dependabot.yml`  
**Features**:
- Automatic dependency version monitoring
- Security update alerts and PRs
- Version update PRs (scheduled weekly)
- Ecosystem: npm

**Update Schedule**:
- Security updates: Immediate (within hours)
- Version updates: Weekly (Monday at 00:00 UTC)

### 4. Signed Commits
**Status**: Required via GitHub Ruleset  
**Requirement**: All commits to main must be GPG-signed  
**Enforcement**: GitHub Actions and ruleset validation

## Secrets Management

### Allowed Secret Types
- GitHub Tokens (authentication)
- API Keys (services)
- JWT Secrets (authentication)
- Database credentials

### Disallowed Practices
- Hardcoding secrets in source code
- Committing .env files with real secrets
- Storing secrets in commit messages

### Secret Handling Process
1. Developers use `.env.local` (gitignored) for local development
2. `.env.example` provides template without secrets
3. CI/CD systems use GitHub Actions Secrets for deployment
4. Secret scanning prevents accidental commits

## Continuous Monitoring

### CI/CD Integration
All security checks run automatically on:
- Pull requests (blocks merge if failing)
- Pushes to main (informational only, main is protected)

### Reporting
Security alerts are available in GitHub Security tab:
- Code scanning results (CodeQL)
- Dependency alerts (Dependabot)
- Secret scanning results
- Supply chain risks

## Team Responsibilities

1. **Developers**
   - Review and address CodeQL findings
   - Review and merge Dependabot PRs
   - Avoid committing secrets

2. **Security/DevOps**
   - Monitor security alerts
   - Keep CodeQL queries updated
   - Review Dependabot policy

3. **Maintainers**
   - Merge security update PRs promptly
   - Address critical vulnerabilities within 24h

## Incident Response

**Critical Vulnerability Found**:
1. Immediate patch branch created (patch/vX.Y.Z_PATCH-...)
2. Fix committed and pushed to feature/patch branch
3. PR created without delays
4. Expedited merge process bypassing standard review
5. Release notification to users

## Compliance Notes

- This repository is public; all scanning results are visible
- No private security information is committed
- All dependencies must be approved licenses (check LICENSE files)
