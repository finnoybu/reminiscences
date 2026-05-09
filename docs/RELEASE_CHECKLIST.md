# Release Checklist

Use this checklist before releasing Reminiscences v0.1.x+ to production.

## Pre-Release Validation (24h before)

- [ ] All PRs merged to main and CI green
- [ ] No outstanding critical security issues
- [ ] Dependabot updates reviewed and merged
- [ ] Release notes drafted
- [ ] Version number decided (follow SemVer)

## Release Day - Code Freeze

- [ ] Create release branch: `release/vX.Y.Z` from main
- [ ] Update version in package.json
- [ ] Update CHANGELOG.md with release notes
- [ ] Commit: `chore: release vX.Y.Z`
- [ ] Create annotated tag: `git tag -a vX.Y.Z -m "Release vX.Y.Z"`
- [ ] Push branch and tag

## Pre-Deployment

- [ ] Build artifacts generated successfully
- [ ] Staging deployment successful
- [ ] Smoke tests pass on staging
- [ ] Database migrations verified (if applicable)
- [ ] Environment variables documented

## Deployment

- [ ] Backup current production state
- [ ] Production deployment initiated
- [ ] Health checks pass on production
- [ ] Critical user flows verified manually
- [ ] Monitoring alerts configured

## Post-Release

- [ ] Release announcement published
- [ ] Documentation updated
- [ ] GitHub Release created with release notes
- [ ] Merge release branch back to main:
  - `git checkout main; git pull; git merge release/vX.Y.Z; git push origin main`
- [ ] Delete release branch: `git push origin :release/vX.Y.Z`

## Rollback Plan (If Needed)

See [ROLLBACK_POLICY.md](ROLLBACK_POLICY.md) for detailed rollback procedures.

**Quick Rollback Steps**:
1. Identify last known good version tag
2. Create hotfix/patch branch from that tag
3. Deploy previous version to production
4. Document incident in CHANGELOG.md
5. Post-mortem within 48 hours

## Disaster Recovery

See [DISASTER_RECOVERY.md](DISASTER_RECOVERY.md) for comprehensive DR procedures.

## Sign-Off

- [ ] Release Manager: _________________ Date: _______
- [ ] QA Lead: _________________________ Date: _______
- [ ] Operations: ______________________ Date: _______

## Communication

- [ ] Notify stakeholders of release
- [ ] Update status page if applicable
- [ ] Monitor support channels for issues
- [ ] Be available for 24h post-release
