#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { findObsidianVaults, loadVaultPath, saveVaultPath, promptUser, copyPluginToVault } = require('./utils')

// Get plugin name from package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const pluginName = packageJson.name

async function main() {
  console.log('🔍 Scanning for Obsidian vaults...')

  let selectedVault = loadVaultPath()

  if (!selectedVault) {
    const vaults = findObsidianVaults()

    if (vaults.length === 0) {
      console.log('❌ No Obsidian vaults found. Please make sure you have Obsidian installed and have opened at least one vault.')
      process.exit(1)
    }

    console.log(`✅ Found ${vaults.length} vault(s):`)

    selectedVault = await promptUser('Select a vault to copy the plugin to:', vaults, null)
    saveVaultPath(selectedVault)
  } else {
    console.log(`✅ Using saved vault: ${selectedVault}`)
  }

   try {
     copyPluginToVault(selectedVault, pluginName)
     console.log('✅ Plugin successfully copied!')
     console.log('🔄 You can now reload the plugin in Obsidian (Settings → Community plugins → Reload plugins)')
   } catch (error) {
    console.error('❌ Error copying plugin:', error.message)
    process.exit(1)
  }

  process.exit(0)
}

main().catch(console.error)