# Release Instructions

Releases are driven by [release-please](https://github.com/googleapis/release-please) in CI. There is no local release command.

## Flow

1. Merge changes to `main` with conventional commit messages (`fix:`, `feat:`, and so on). Release-please derives the next version from them.
2. CI (`.github/workflows/ci.yml`) runs type check, tests and build on every push and pull request.
3. The `Release Please` workflow opens or updates a release PR on `main` with:
   - the new version in `package.json`
   - the new version in `manifest.json` and `manifest-beta.json`
   - a new section in `CHANGELOG.md`
4. Merge the release PR. Release-please creates the tag and the GitHub release.
5. The `Release obsidian plugin` workflow builds the merged tag, runs checks and tests again, and attaches `main.js`, `manifest.json`, `styles.css` and a zip to the release.
6. The same workflow appends the new version and its `minAppVersion` to `versions.json` on `main` with a `[skip ci]` commit.

## Manual rebuild

If assets are missing from a release, run the release workflow manually with the tag as input:

```bash
gh workflow run release.yml -f tag=0.0.44
```

## Versioning notes

- Tags carry no `v` prefix and no component name.
- `bump-minor-pre-major` is enabled, so breaking changes bump the minor version while the plugin is below 1.0.
- `versions.json` is not touched by release-please; the workflow adds the version key after the release exists.
- `manifest-beta.json` tracks `manifest.json` and is updated by release-please together with it.
