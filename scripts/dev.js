#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { build } = require('vite')
const { findObsidianVaults, loadVaultPath, saveVaultPath, promptUser, copyPluginToVault } = require('./utils')

// Get plugin name from package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const pluginName = packageJson.name

async function main() {
  console.log('🔍 Scanning for Obsidian vaults...')

  const vaults = findObsidianVaults()

  if (vaults.length === 0) {
    console.log('❌ No Obsidian vaults found. Please make sure you have Obsidian installed and have opened at least one vault.')
    process.exit(1)
  }

  console.log(`✅ Found ${vaults.length} vault(s):`)

  const formerVault = loadVaultPath()
  const vaultPath = await promptUser('Select a vault to copy the plugin to:', vaults, formerVault)
  saveVaultPath(vaultPath)

  console.log(`Starting dev server with vault: ${vaultPath}`)

  try {
     await build({
       configFile: path.join(__dirname, '..', 'vite.config.ts'),
       mode: 'development',
       build: {
         watch: {},
         sourcemap: 'inline'
       },
      plugins: [
        {
          name: 'copy-to-vault',
          writeBundle() {
            copyPluginToVault(vaultPath, pluginName)
          }
        }
      ]
    })
  } catch (error) {
    console.error('Build error:', error)
    process.exit(1)
  }
}

main().catch(console.error)