#!/usr/bin/env node

import { build } from 'vite';
import { copyPluginToVault, getPluginId, selectVault } from './utils.ts';

const pluginName = getPluginId();
const useDefaultVault = process.argv.includes('--default');

async function main(): Promise<void> {
    const vaultPath = await selectVault({ useDefault: useDefaultVault });
    console.log(`Starting dev server with vault: ${vaultPath}`);

    try {
        await build({
            mode: 'development',
            build: {
                watch: {},
                sourcemap: 'inline',
            },
            plugins: [
                {
                    name: 'copy-to-vault',
                    writeBundle() {
                        copyPluginToVault(vaultPath, pluginName);
                    },
                },
            ],
        });
    } catch (error: unknown) {
        console.error('Build error:', error);
        process.exit(1);
    }
}

main().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
});
