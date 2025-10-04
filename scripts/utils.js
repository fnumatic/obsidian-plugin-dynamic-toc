const fs = require('fs')
const path = require('path')

function findObsidianVaults() {
  const homeDir = process.env.HOME || process.env.USERPROFILE
  const vaults = []

  // Read from Obsidian config for vaults
  const configPath = path.join(homeDir, '.config', 'obsidian', 'obsidian.json')
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
      if (config.vaults) {
        for (const vaultId in config.vaults) {
          const vaultInfo = config.vaults[vaultId]
          if (vaultInfo.path && fs.existsSync(vaultInfo.path)) {
            const obsidianPath = path.join(vaultInfo.path, '.obsidian')
            if (fs.existsSync(obsidianPath) && fs.statSync(obsidianPath).isDirectory()) {
              vaults.push(vaultInfo.path)
            }
          }
        }
      }
    } catch (error) {
      // Ignore config read errors
    }
  }

  return vaults
}

function loadVaultPath() {
  const vaultFile = path.join(__dirname, '..', '.vault')
  if (fs.existsSync(vaultFile)) {
    return fs.readFileSync(vaultFile, 'utf8').trim()
  }
  return null
}

function saveVaultPath(vaultPath) {
  const vaultFile = path.join(__dirname, '..', '.vault')
  fs.writeFileSync(vaultFile, vaultPath)
}

function promptUser(question, options, formerVault = null) {
  console.log(question)
  options.forEach((option, index) => {
    const marker = (formerVault && option === formerVault) ? '*' : ' '
    console.log(`${index + 1}. ${marker} ${option}`)
  })

  process.stdout.write('Enter your choice (number): ')

  return new Promise((resolve) => {
    process.stdin.once('data', (data) => {
      const choice = parseInt(data.toString().trim())
      if (choice >= 1 && choice <= options.length) {
        resolve(options[choice - 1])
      } else {
        console.log('Invalid choice. Please try again.')
        resolve(promptUser(question, options, formerVault))
      }
    })
  })
}

function copyPluginToVault(vaultPath, pluginName) {
  const pluginDir = path.join(vaultPath, '.obsidian', 'plugins', pluginName)
  const distDir = path.join(__dirname, '..', 'dist')

  // Create plugin directory if it doesn't exist
  if (!fs.existsSync(pluginDir)) {
    fs.mkdirSync(pluginDir, { recursive: true })
  }

  // Files to copy
  const filesToCopy = ['manifest.json', 'main.js']

  filesToCopy.forEach(file => {
    let srcPath
    if (file === 'manifest.json') {
      srcPath = path.join(__dirname, '..', 'manifest.json')
    } else {
      srcPath = path.join(distDir, file)
    }
    const destPath = path.join(pluginDir, file)

    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath)
      console.log(`Copied ${file} to ${destPath}`)
    } else {
      console.log(`Warning: ${file} not found`)
    }
  })

  // Check for optional styles.css
  const stylesSrc = path.join(distDir, 'styles.css')
  const stylesDest = path.join(pluginDir, 'styles.css')
  if (fs.existsSync(stylesSrc)) {
    fs.copyFileSync(stylesSrc, stylesDest)
    console.log(`Copied styles.css to ${stylesDest}`)
  }

  console.log(`Plugin "${pluginName}" copied to vault: ${vaultPath}`)
}

module.exports = {
  findObsidianVaults,
  loadVaultPath,
  saveVaultPath,
  promptUser,
  copyPluginToVault
}