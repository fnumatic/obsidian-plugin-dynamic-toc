
import { promises } from "fs";
import { copyFile } from "fs/promises";
import { join } from "path";
const { readFile, writeFile } = promises;
import { Plugin } from "release-it";

const mainManifest = "manifest.json",
  betaManifest = "manifest-beta.json",
  versionsList = "versions.json";
const targets = [mainManifest, betaManifest, versionsList];


class ObsidianVersionBump extends Plugin {
  isPreRelease (){
    return this.config.localConfig.github.preRelease == true 
  }
  async readJson(path) {
    // const { isDryRun } = this.config;
    try {
      const result = JSON.parse(await readFile(path, "utf8"));
      return result;
    } catch (error) {
      if (error.code === "ENOENT") {
        return null;
      }
      throw error;
    }
  }
  async writeJson(file, data) {
    // const { isDryRun } = this.config;
    const { indent = 4 } = this.getContext();
    await writeFile(file, JSON.stringify(data, null, indent));
    // this.log.exec(`Write to ${file}`, isDryRun);
  }

  /**
   * always read from previous version of manifest
   */
  async readManifest() {
    const { isDryRun } = this.config;
    const latest = this.isPreRelease();
    let manifestToRead = this.getManifest(latest);
    this.log.exec(`Reading manifest from ${manifestToRead}`, isDryRun);
    let manifest;
    if (!(manifest = await this.readJson(manifestToRead))) {
      manifestToRead = this.getManifest(!latest);
      this.log.exec(`retry reading manifest from ${manifestToRead}`, isDryRun);
      manifest = await this.readJson(manifestToRead);
    }
    if (!manifest) throw new Error("Missing manifest data");
    return manifest;
  }

  async writeManifest(targetVersion, manifest) {
    const { isDryRun } = this.config;
    const manifestToWrite = this.getManifest(this.isPreRelease());
    const updatedMainfest = { ...manifest, version: targetVersion };
    !isDryRun && (await this.writeJson(manifestToWrite, updatedMainfest));
    this.log.exec(
      `Wrote version ${targetVersion} to ${manifestToWrite}`,
      isDryRun,
    );
    await this.syncManifest(targetVersion);
  }

  /**
   * if bump to official release
   * sync manifest-beta.json with manifest.json
   */
  async syncManifest(targetVersion) {
    const target = this.isPreRelease();
    const { isDryRun } = this.config;
    if (!target) {
      !isDryRun && (await copyFile(mainManifest, betaManifest));
      this.log.exec(`Syncing ${betaManifest} with ${mainManifest}`, isDryRun);
    }
  }

  async copyToRoot() {
    const { copyTo } = this.getContext();
    if (!copyTo) return;
    const { isDryRun } = this.config;
    if (!isDryRun) {
      await Promise.all(
        targets.map((file) =>
          copyFile(file, join(copyTo, file)).catch((err) => {
            if (err.code !== "ENOENT") throw err;
          }),
        ),
      );
    }
    this.log.exec(`Copied ${targets.join(", ")} to ${copyTo}`, isDryRun);
  }

  /**
   * update versions.json with target version and minAppVersion from manifest.json
   */
  async writeVersion(targetVersion, { minAppVersion }) {
    const { isDryRun } = this.config;
    const versions = await this.readJson(versionsList);
    versions[targetVersion] = minAppVersion;
    !isDryRun && (await this.writeJson(versionsList, versions));
    this.log.exec(
      `Wrote version ${targetVersion} to ${versionsList}`,
      isDryRun,
    );
  }

  getManifest(isPreRelease) {
    return isPreRelease ? betaManifest : mainManifest;
  }

  async bump(targetVersion) {
    // read minAppVersion from manifest and bump version to target version
    const manifest = await this.readManifest(targetVersion);
    this.log.info(`min obsidian app version: ${manifest.minAppVersion}`);
    this.log.info(`plugin preRelease: ${this.isPreRelease()}`);
    await Promise.all([
      this.writeManifest(targetVersion, manifest),
      this.writeVersion(targetVersion, manifest),
    ]);
    await this.copyToRoot();
  }
}
export default ObsidianVersionBump;