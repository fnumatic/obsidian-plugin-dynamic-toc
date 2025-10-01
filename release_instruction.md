# Release Instructions for Obsidian Dynamic TOC Plugin

This document outlines the steps to release the Obsidian Dynamic TOC plugin, covering both beta (pre-release) and official releases. The process uses `release-it` for automation, which handles versioning, changelog generation, commits, tagging, and GitHub releases.

## Prerequisites

- Ensure all changes are committed with conventional commit messages (e.g., `feat: add new feature`, `fix: resolve bug`).
- Verify the codebase builds successfully: `pnpm build`.
- Run tests: `pnpm test`.
- Have push access to the GitHub repository.

## Overview of Release Process

The release process involves:
1. **Version Determination**: `release-it` analyzes commits since the last tag to determine the next version (patch, minor, major).
2. **File Updates**:
   - Updates `package.json` version.
   - Updates `CHANGELOG.md` with a new section based on conventional commits.
   - Updates manifest files via `scripts/ob-bumper.mjs`:
     - For beta: Updates `manifest-beta.json`.
     - For official: Updates `manifest.json` and syncs `manifest-beta.json`.
   - Updates `versions.json` with the new version and minAppVersion.
3. **Git Operations**: Commits changes, creates a tag, pushes to GitHub.
4. **GitHub Release**: Creates a release (pre-release for beta), and the CI workflow uploads build artifacts.

## Beta Release (Pre-Release)

Beta releases are for testing new features or fixes before a full release. They use `manifest-beta.json` for versioning and create a pre-release on GitHub.

### Steps
1. **Configure for Beta**:
   - Edit `.release-it.json` and set `"preRelease": true` (it should already be true by default).
   - This tells `release-it` to treat it as a pre-release.

2. **Run the Release**:
   - Execute: `pnpm release`
   - `release-it` will:
     - Prompt for confirmation and version bump type if needed.
     - Update `manifest-beta.json` with the new version.
     - Update `CHANGELOG.md` with unreleased changes.
     - Commit and tag (e.g., `v0.0.39-beta.1`).
     - Push to GitHub.

3. **Post-Release**:
   - The GitHub workflow (`.github/workflows/release.yml`) triggers on tag push.
   - It builds the plugin, creates a pre-release, and uploads `main.js`, `manifest.json`, `styles.css`, and a zip file.
   - Users can install the beta via the GitHub release.

### What Happens in Detail
- `release-it` uses the `@release-it/conventional-changelog` plugin to generate the changelog from commits.
- `scripts/ob-bumper.mjs` reads the current manifest (prefers `manifest-beta.json` for pre-releases), bumps the version, and writes back.
- No syncing of manifests occurs for beta releases.
- The GitHub release is marked as a pre-release, allowing early testing.

## Official Release

Official releases are stable versions for public use. They use `manifest.json` and create a full GitHub release.

### Steps
1. **Configure for Official**:
   - Edit `.release-it.json` and set `"preRelease": false`.
   - This switches to official release mode.

2. **Run the Release**:
   - Execute: `pnpm release`
   - `release-it` will:
     - Prompt for confirmation.
     - Update `manifest.json` with the new version.
     - Sync `manifest-beta.json` to match `manifest.json`.
     - Update `CHANGELOG.md`.
     - Commit and tag (e.g., `v0.0.39`).
     - Push to GitHub.

3. **Post-Release**:
   - The GitHub workflow builds and creates a full release.
   - Artifacts are uploaded, and the release is published.
   - The plugin is available for installation via Obsidian's community plugins.

### What Happens in Detail
- Similar to beta, but `scripts/ob-bumper.mjs` uses `manifest.json` and copies it to `manifest-beta.json` to keep them in sync.
- The GitHub release is not marked as pre-release.
- This ensures beta and stable versions align after an official release.

## Dry Run
To preview changes without applying them:
- Run: `pnpm release:dry`
- This shows what would be updated, committed, etc., without making changes.

## Troubleshooting
- If commits aren't conventional, `release-it` may not bump correctly – review and amend commits.
- Ensure `manifest.json` and `manifest-beta.json` have valid JSON.
- Check GitHub workflow logs if builds fail.

## Notes
- Always test the release in a branch first if unsure.
- The workflow assumes `main.js`, `manifest.json`, and `styles.css` are in the root after build.
- For major changes, manually review the changelog before pushing.