# Release Checklist

Use this checklist before releasing a new version to production.

## Pre-Release

- [ ] All PRs merged and CI passing on `main`
- [ ] Release notes drafted (if applicable)
- [ ] Version number decided (follow SemVer)
- [ ] Breaking changes documented
- [ ] Dependencies audited (`npm audit`)
- [ ] Security scanning passed (CodeQL + Dependabot)

## Testing

- [ ] Manual testing completed on all major features
- [ ] Content validation passing (`pnpm run validate:content`)
- [ ] Content hash verification passing (`pnpm run hash:verify`)
- [ ] Branch naming validation passing
- [ ] All automated checks green

## Documentation

- [ ] CHANGELOG.md updated
- [ ] README.md reflects current state
- [ ] API documentation (if applicable) is current
- [ ] RELEASE_NOTES.md or similar is complete

## Deployment

- [ ] Backup existing environment
- [ ] Review ROLLBACK_POLICY.md procedures
- [ ] Stage release in test environment
- [ ] Run smoke tests
- [ ] Execute production deployment
- [ ] Verify application health post-deployment

## Post-Release

- [ ] Monitor logs for errors
- [ ] Verify all external integrations working
- [ ] Send release notifications
- [ ] Tag version in git matching deployed commit
- [ ] Close related issues/PRs
- [ ] Update project documentation with new version info

## Rollback Trigger

If any step fails or production errors appear:

1. Immediately review [ROLLBACK_POLICY.md](docs/ROLLBACK_POLICY.md)
2. Execute rollback procedure
3. Post-mortem: document what went wrong
4. Fix in new release cycle

## Contact

**Release Owner**:  [Name/Team]
**Approval Authority**: [Name/Team]
**Escalation**: [Contact Info]
