# Release and Versioning Guide

This guide explains how to use standard-version for managing releases and changelogs.

## Prerequisites

- Git repository configured
- Conventional commits being used
- standard-version installed (already done)

## Quick Reference

### Release Commands

```bash
cd apps/agent

# Patch release (bug fixes): 0.2.0 → 0.2.1
npm run release:patch

# Minor release (new features): 0.2.0 → 0.3.0
npm run release:minor

# Major release (breaking changes): 0.2.0 → 1.0.0
npm run release:major

# Auto-detect based on commits
npm run release
```

## Workflow

### Step 1: Make Changes and Commit

Use conventional commit format:

```bash
# Feature
git commit -m "feat: add new workflow type"

# Bug fix
git commit -m "fix: correct agent polling interval"

# Documentation
git commit -m "docs: update API reference"

# Performance improvement
git commit -m "perf: optimize task polling"

# Breaking change
git commit -m "feat!: change authentication method"
```

### Step 2: Create Release

```bash
npm run release:minor
```

This command:
1. ✅ Analyzes commits since last tag
2. ✅ Determines version bump (uses your choice)
3. ✅ Updates `package.json` version
4. ✅ Generates CHANGELOG.md entries
5. ✅ Creates git commit: `chore(release): v0.3.0`
6. ✅ Creates git tag: `v0.3.0`

### Step 3: Push and Publish

```bash
# Push commits and tags
git push origin main --follow-tags

# Publish to npm
npm publish --access public
```

## Commit Types

| Type | Semver | Section | Example |
|------|--------|---------|---------|
| `feat` | MINOR | Features | `feat: add real-time progress updates` |
| `fix` | PATCH | Bug Fixes | `fix: correct token expiration check` |
| `perf` | PATCH | Performance | `perf: optimize API polling` |
| `docs` | - | Documentation | `docs: update API docs` |
| `refactor` | - | Code Refactoring | `refactor: simplify CLI logic` |
| `test` | - | Tests | `test: add CLI tests` |
| `chore` | - | Chores | `chore: update dependencies` |
| `BREAKING CHANGE` | MAJOR | Breaking Changes | `feat!: new CLI syntax` |

## Examples

### Example 1: Multiple Features

```bash
# Make commits
git commit -m "feat: add retry logic"
git commit -m "feat: improve error messages"
git commit -m "fix: correct config validation"

# Create release
npm run release:minor
# → 0.2.0 → 0.3.0 (because of 'feat' commits)
```

Generated CHANGELOG entry:
```markdown
## [0.3.0] - 2025-01-24

### Features
- Add retry logic
- Improve error messages

### Bug Fixes
- Correct config validation
```

### Example 2: Only Bug Fixes

```bash
# Make commits
git commit -m "fix: correct token validation"
git commit -m "fix: handle network timeouts"

# Create release
npm run release:patch
# → 0.2.0 → 0.2.1 (only 'fix' commits)
```

### Example 3: Breaking Changes

```bash
# Make commit with breaking change
git commit -m "feat!: change command syntax

BREAKING CHANGE: old 'devflow-agent' renamed to 'devflow'"

# Create release
npm run release:major
# → 0.2.0 → 1.0.0 (breaking change)
```

## CHANGELOG Format

The CHANGELOG.md is automatically formatted as:

```markdown
## [VERSION] - DATE

### Features
- Feature 1
- Feature 2

### Bug Fixes
- Fix 1

### Performance
- Performance improvement 1

### Code Refactoring
- Refactor 1

### Documentation
- Doc update 1
```

## Dry Run

Test without making changes:

```bash
# See what would happen
npx standard-version --dry-run

# See what would happen for patch
npx standard-version --dry-run --release-as patch
```

## Undo a Release

If you made a mistake:

```bash
# Remove the tag
git tag -d v0.3.0

# Remove the commit
git reset --soft HEAD~1

# Fix and try again
npm run release:minor
```

## Configuration

The `.versionrc.json` file controls:

- **Commit types** - How commits are categorized
- **Git URLs** - Links to commits, compare, issues
- **Release message** - Format of the release commit

View current config:
```bash
cat .versionrc.json
```

## Best Practices

1. ✅ Use conventional commits consistently
2. ✅ Keep CHANGELOG.md in version control
3. ✅ Test with `--dry-run` before real release
4. ✅ Push tags: `git push --follow-tags`
5. ✅ Publish after git push succeeds
6. ✅ Document breaking changes in commit body

## Integration with CI/CD

Example GitHub Actions workflow:

```yaml
- name: Create Release
  if: startsWith(github.ref, 'refs/tags/v')
  run: |
    npm publish --access public
```

## More Information

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [standard-version docs](https://github.com/conventional-changelog/standard-version)

---

**Happy releasing!** 🚀
