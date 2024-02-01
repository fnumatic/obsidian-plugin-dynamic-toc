const versionUpdater = {
  filename: "versions.json",
  updater: require("./scripts/versions-updater"),
};
const manifestUpdater = {
  filename: "manifest.json",
  updater: require("./scripts/manifest-updater"),
};

const packageJson = {
  filename: "package.json",
  type: "json",
};
export const bumpFiles = [packageJson, versionUpdater, manifestUpdater];
export const packageFiles = [packageJson];
