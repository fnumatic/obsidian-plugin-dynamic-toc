# Feature Document: Enhanced Build Management

## Overview
Improve the development workflow by adding automatic hot reload support and streamlined vault management for faster plugin development iterations.

## Motivation
Current development process requires manual vault selection and lacks hot reload integration, slowing down the development cycle. Developers need:
- Automatic plugin reloading without restarting Obsidian
- Quick access to default test vault
- Streamlined development workflow

## Scope (MVP)
- Automatic `.hotreload` file creation in dev vaults
- New `dev:default` script for instant default vault access
- Enhanced vault management utilities

## Out of Scope (Future)
- Multiple vault configurations
- Automatic vault creation
- Advanced hot reload configurations

## Technical Implementation

### Hot Reload Integration
The [Hot Reload plugin](https://github.com/pjeby/hot-reload) requires a `.hotreload` file in the plugin directory to enable automatic plugin reloading. This file should be automatically created when running dev mode.

### Default Vault Script
Add `dev:default` script that:
1. Checks for predefined default vault path
2. Uses existing vault if `.vault` file exists
3. Falls back to first available vault if no default set
4. Skips user prompt for instant startup

### File Structure Changes
```
scripts/
  utils.js          # Enhanced with hot reload utilities
  dev-default.js    # New script for default vault dev mode
.vault              # Current vault selection (existing)
.obsidian/plugins/{plugin-name}/
  .hotreload        # Auto-generated in plugin directory
```

## User Experience
### Current Flow:
1. `pnpm dev` → Scan vaults → User selects → Save choice → Start dev
2. Manual Hot Reload plugin installation required
3. Restart Obsidian for plugin changes

### Enhanced Flow:
1. `pnpm dev` → Same as before + auto-create `.hotreload`
2. `pnpm dev:default` → Instant startup with saved/default vault
3. Plugin changes reload automatically in Obsidian

## Implementation Details

### Hot Reload File Creation
```javascript
// In utils.js - copyPluginToVault function
function ensureHotReloadFile(vaultPath, pluginName) {
  const pluginDir = path.join(vaultPath, '.obsidian', 'plugins', pluginName);
  const hotReloadPath = path.join(pluginDir, '.hotreload');
  if (!fs.existsSync(hotReloadPath)) {
    fs.writeFileSync(hotReloadPath, '');
    console.log('Created .hotreload file for hot reload support');
  }
}
```

### Default Vault Script
```javascript
// New dev-default.js
const { loadVaultPath, findObsidianVaults, copyPluginToVault } = require('./utils');
const { build } = require('vite');
const path = require('path');

async function main() {
  let vaultPath = loadVaultPath();

  if (!vaultPath) {
    const vaults = findObsidianVaults();
    if (vaults.length === 0) {
      console.error('No vaults found');
      process.exit(1);
    }
    vaultPath = vaults[0]; // Use first available vault as default
    console.log(`Using default vault: ${vaultPath}`);
  }

  // Ensure hot reload file exists
  ensureHotReloadFile(vaultPath, pluginName);

  // Start dev build with auto-copy
  await build({ /* ... */ });
}
```

## Success Criteria
- ✅ `.hotreload` file automatically created in dev vaults
- ✅ `dev:default` script starts instantly without prompts
- ✅ Hot Reload plugin works out-of-the-box
- ✅ Backward compatibility with existing `dev` script

## Dependencies
- Hot Reload plugin: https://github.com/pjeby/hot-reload
- No additional npm dependencies required
- Uses existing vault detection logic

## Testing
- Verify `.hotreload` file creation
- Test `dev:default` script with and without saved vault
- Confirm hot reload functionality works
- Ensure existing `dev` script unchanged

This enhancement significantly improves the development experience by eliminating manual setup steps and enabling instant plugin reloading during development.