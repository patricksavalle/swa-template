---
name: release-management
description:
    Protocol for shipping a production release. Triggers when the user asks to
    publish to production, release develop to main, or create a production
    merge request.
---

# Release Management Protocol

This skill dictates the protocol for creating and shipping a production release
from the `develop` branch to the `main` branch.

> **TL;DR / Core Directives**
>
> 1. **Branch Sequence**: Branch from `develop`. Merge `release/vX.Y.Z` to
>    `main`.
> 2. **Changelogs**: Update the developer changelog and, when present, the
>    user-facing changelog.
> 3. **Calendar Versioning**: Bump version using `YYYY.M.D` format unless the
>    project has chosen another version policy.
> 4. **Strict Protocol**: Follow the git, CI, and release steps in order.

## When to use this skill

- When the user requests to "publish to production", "release develop to main",
  or "create a release PR".
- **Out of scope:** Feature development branches and emergency hotfixes outside
  of the `develop` -> `main` pipeline.

## 2. Git Branching Model

- **develop**: day-to-day development.
- **release/vX.Y.Z**: release preparation branch created from develop.
- **main**: production. Merging to main triggers deployment.

## 3. Execution Protocol

Follow these steps precisely.

### Step 1: Sync Develop and Create Release Branch

Always branch from **develop**.

```bash
git checkout develop
git pull
git merge origin/main
git push origin develop
```

Then create the release branch. Replace `vX.Y.Z` with the new version, for
example `v2026.3.8`.

```bash
git checkout -b release/vX.Y.Z
```

### Step 2: Write the Changelogs

Parse the recent commits since the last release:

```bash
git log origin/main..develop --oneline --no-merges -n 50
```

**Filter intra-release-cycle bug fixes.** Commits in `origin/main..develop`
represent code that has never reached production. If a `fix:` commit in this
window resolves a defect introduced by another commit in the same window, the
user never experienced the bug.

| Introduction commit | Developer changelog | User changelog |
| --- | --- | --- |
| In same release window (`origin/main..develop`) | Omit as noise | Omit: never reached user |
| In a prior released version | Include | Include if user-visible |

Update the applicable changelogs:

1. **Developer changelog (`CHANGELOG.md`)**: Add an entry at the top following
   Keep a Changelog format. Document technical changes that affect shipped code.
2. **User changelog (`docs/user-changelog.md` or project equivalent)**: Add an
   entry only when the project publishes a user-facing changelog.

User-facing changelog rules:

- Use the target audience's language.
- Describe what the user experiences, never how it works internally.
- Do not include function names, file names, API routes, class names, internal
  flags, data storage details, or server infrastructure.
- Do not include bugs introduced and fixed within the same release window.
- Include only changes that are visible or noticeable to users.

Recommended section headings:

- Added
- Changed
- Fixed
- Removed
- Security

### Step 3: Bump the Version

For CalVer projects:

```bash
npm pkg set "version=$(date +'%Y.%-m.%-d')"
git add package.json CHANGELOG.md docs/user-changelog.md
git commit -m "release: v$(date +'%Y.%-m.%-d')"
```

If a release happened earlier today, append `-1`, `-2`, etc. If the project
does not have a user-facing changelog, omit that path from `git add`.

### Step 4: Push and Create PR

Push the release branch:

```bash
git push -u origin release/vX.Y.Z
```

Create the PR to `main`:

```bash
gh pr create --base main --title "release: vX.Y.Z" --body "## Release vX.Y.Z\n\n[Summary of changes]"
```

### Step 5: Post-Merge Cleanup and GitHub Release

Wait for the user to approve and merge the PR. Once merged, run:

```bash
gh release create vX.Y.Z --target main --title "vX.Y.Z" \
  --notes "$(awk '/^## \[X\.Y\.Z\]/{flag=1; print; next} /^## \[/{flag=0} flag' CHANGELOG.md)"
git checkout develop
git pull
git merge origin/main
git push origin develop
git branch -d release/vX.Y.Z
git push origin --delete release/vX.Y.Z
```

Pass only the new version's changelog section into the GitHub release notes.
Merge `origin/main` into develop after the release so the development branch has
the exact production state.

## 4. Definition of Done

The release is done when:

1. Changelogs are updated and committed.
2. The version is bumped in `package.json`.
3. The PR to `main` is created, merged, and the GitHub release is published.
4. The release branch is deleted and `develop` is synced.

## 5. Deployment Impact

For static web apps, users receive the new build after the hosting platform
serves the updated assets. If the project uses a service worker, verify the
update flow explicitly: old assets must not trap users on a stale release.

## 6. File Reference

| File | Purpose |
| --- | --- |
| `CHANGELOG.md` | Developer-facing release notes. |
| `docs/user-changelog.md` | Optional user-facing changelog. |
| `package.json` | Version number when the project is npm-based. |
| `.github/workflows/` | CI/CD release gates and deployment workflows. |
