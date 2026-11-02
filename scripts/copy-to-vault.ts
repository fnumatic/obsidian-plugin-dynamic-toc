#!/usr/bin/env node

import { build } from 'vite';
import { copyPluginToVault, getPluginId, selectVault } from './utils.ts';

const pluginName = getPluginId();

async function main(): Promise<void> {
    console.log('🔨 Building plugin...');

    try {
        await build({
            mode: 'production',
        });
    } catch (error: unknown) {
        console.error('Build error:', error);
        process.exit(1);
    }

    const vaultPath = await selectVault();
    console.log(`Copying plugin "${pluginName}" to vault: ${vaultPath}`);
    copyPluginToVault(vaultPath, pluginName);
}

main().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
});
