## Plan: Migrating obsidian-plugin-cli to Vite.js Build Environment

Based on my analysis of the current esbuild-based implementation, here's a comprehensive plan to create your own build environment using Vite.js
that implements the first two features (build and dev commands).

### Current Architecture Analysis

Build Command Features:

• Production build with minification
• Configurable output directory (default: dist/)
• Stylesheet inclusion support
• Entry point specification
• Manifest.json copying
• esbuild config file support via cosmiconfig

Dev Command Features:

• Watch mode for continuous development
• Vault detection and selection
• Automatic plugin copying to vault
• Hot-reload plugin integration
• Manifest.json synchronization
• WSL path handling

### Vite.js Migration Plan

#### Phase 1: Core Build System Setup

1.1 Replace esbuild with Vite

• Create vite.config.ts with equivalent configuration:
// Key Vite config mappings:
// esbuild.platform: "node" → Vite build.target: "node14"
// esbuild.external → Vite build.rollupOptions.external
// esbuild.format: "cjs" → Vite build.lib.formats: ["cjs"]
// esbuild.bundle: true → Vite build.lib: { entry, formats: ["cjs"] }


1.2 Handle External Dependencies

• Map current esbuild externals to Vite's external configuration:
// External: obsidian, electron, @codemirror/*, @lezer/*, builtinModules
// Vite equivalent: build.rollupOptions.external


1.3 Configuration Loading

• Adapt getConfig() function to load Vite config instead of esbuild config
• Support .vite.config.ts, vite.config.js, etc. via cosmiconfig

#### Phase 2: Build Command Implementation

2.1 Production Build Logic

• Replace build() function calls with Vite's build() API
• Map esbuild options to Vite equivalents:
 • minify: true → build.minify: true
 • outdir → build.outDir
 • outfile → build.lib.fileName or build.rollupOptions.output.file


2.2 Stylesheet Handling

• Adapt stylesheet inclusion logic for Vite's CSS processing
• Consider using Vite's build.cssCodeSplit: false for single CSS file output

2.3 Manifest Copying

• Maintain existing manifest.json copying logic (unchanged)

#### Phase 3: Dev Command Implementation

3.1 Watch Mode Setup

• Use Vite's createServer() with server.watch configuration
• Replace esbuild watch mode with Vite's HMR system

3.2 Vault Integration

• Keep existing vault detection and selection logic (unchanged)
• Adapt file copying to work with Vite's output structure

3.3 Hot-Reload Integration

• Maintain pjeby hot-reload plugin recommendation
• Ensure Vite's dev server doesn't conflict with Obsidian's plugin loading

#### Phase 4: CLI Interface Preservation

4.1 Command Structure

• Keep existing oclif command structure
• Maintain same CLI flags and arguments:
 • --output-dir, --with-stylesheet, --vault-path, etc.


4.2 Error Handling

• Adapt error handling to Vite's error format
• Maintain user-friendly error messages

#### Phase 5: Testing & Validation

5.1 Compatibility Testing

• Test with existing Obsidian plugin templates
• Verify manifest.json handling
• Test vault integration across platforms

5.2 Performance Comparison

• Compare build times between esbuild and Vite
• Test dev server responsiveness

### Key Technical Considerations

Vite vs esbuild Differences:

1. Configuration: Vite uses vite.config.ts, esbuild uses inline options
2. External Handling: Vite uses Rollup's external system vs esbuild's direct externals
3. Watch Mode: Vite has built-in HMR, esbuild has basic file watching
4. CSS Processing: Vite has advanced CSS handling vs esbuild's basic processing

Migration Challenges:

1. Library Mode: Configure Vite for library output (not SPA)
2. External Dependencies: Ensure all Obsidian-related modules are properly externalized
3. File Structure: Adapt to Vite's expected output structure

### Implementation Steps

1. Setup Vite Configuration - Create base vite.config.ts
2. Implement Build Function - Replace esbuild.build() with vite.build()
3. Adapt Dev Server - Configure Vite dev server for watch mode
4. Update CLI Commands - Modify build.ts and dev.ts to use new build system
5. Test Integration - Verify with sample Obsidian plugins

This plan maintains backward compatibility while leveraging Vite's modern build features and potentially better development experience.