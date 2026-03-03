# SemVer and Branch Policy Enforcement

## Overview
Sea Reader enforces strict SemVer versioning and branch naming conventions through GitHub Actions CI checks on all pull requests.

## Branch Naming Schema

### Feature Branches
Pattern: `feature/vX.Y.Z-<kebab-description>`

Examples:
- `feature/v0.0.1-templates-materialization-and-rulesets`
- `feature/v0.1.0-initial-api-implementation`

### Patch Branches
Pattern: `patch/vX.Y.Z_PATCH-<kebab-description>`

Examples:
- `patch/v0.0.1_PATCH-fix-schema-validation`
- `patch/v0.1.2_PATCH-security-update`

### Main Branch
The `main` branch is protected and only accepts squash merges from reviewed PRs.

## Enforcement Mechanism

### CI Validation
The `validate-versioning.mjs` script runs on every PR and ensures:
1. Branch name matches required pattern
2. Version numbers follow SemVer conventions
3. Invalid branches are rejected by CI

### GitHub Actions Configuration
- Trigger: All pull requests and direct pushes (though main is protected)
- Check Name: `CI / versioning`
- Status: Required (blocks merge)

## Tagging Convention

Before starting any feature or patch branch:
1. Tag current main with the target version: `git tag -a vX.Y.Z -m "vX.Y.Z: description"`
2. Push tag to remote: `git push origin vX.Y.Z`
3. Create feature/patch branch from main

## Compliance Checklist

- [ ] Branch name follows feature/vX.Y.Z-kebab format OR patch/vX.Y.Z_PATCH-kebab format
- [ ] Version numbers follow SemVer (major.minor.patch)
- [ ] Feature branch created AFTER tagging main at that version
- [ ] PR title references the feature/patch being implemented
- [ ] CI / versioning check passes before merge
