import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(import.meta.dirname, '..');
const VAULT_FILE = path.join(ROOT, '.vault');
const MANIFEST_FILE = path.join(ROOT, 'manifest.json');
const DIST_DIR = path.join(ROOT, 'dist');

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

function readJson(filePath: string): unknown {
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed: unknown = JSON.parse(content);
    return parsed;
}

/** Reads the vault list from Obsidian's global config. */
function findObsidianVaults(): string[] {
    const homeDir = process.env.HOME ?? process.env.USERPROFILE;
    if (!homeDir) {
        return [];
    }

    const configPath = path.join(homeDir, '.config', 'obsidian', 'obsidian.json');
    if (!fs.existsSync(configPath)) {
        return [];
    }

    try {
        const config = readJson(configPath);
        if (!isRecord(config) || !isRecord(config.vaults)) {
            return [];
        }

        return Object.values(config.vaults).flatMap((entry): string[] => {
            if (!isRecord(entry) || typeof entry.path !== 'string') {
                return [];
            }
            if (!fs.existsSync(entry.path)) {
                return [];
            }

            const obsidianPath = path.join(entry.path, '.obsidian');
            return fs.existsSync(obsidianPath) && fs.statSync(obsidianPath).isDirectory()
                ? [entry.path]
                : [];
        });
    } catch {
        return [];
    }
}

function loadVaultPath(): string | null {
    if (!fs.existsSync(VAULT_FILE)) {
        return null;
    }

    return fs.readFileSync(VAULT_FILE, 'utf8').trim();
}

function saveVaultPath(vaultPath: string): void {
    fs.writeFileSync(VAULT_FILE, vaultPath);
}

function promptUser(
    question: string,
    options: readonly string[],
    formerVault: string | null,
): Promise<string> {
    console.log(question);
    options.forEach((option, index) => {
        const marker = formerVault === option ? '*' : ' ';
        console.log(`${index + 1}. ${marker} ${option}`);
    });

    process.stdout.write('Enter your choice (number): ');

    return new Promise((resolve) => {
        process.stdin.once('data', (data: Buffer) => {
            const choice = Number.parseInt(data.toString().trim(), 10);
            if (choice >= 1 && choice <= options.length) {
                resolve(options[choice - 1]);
            } else {
                console.log('Invalid choice. Please try again.');
                resolve(promptUser(question, options, formerVault));
            }
        });
    });
}

function ensureHotReloadFile(vaultPath: string, pluginName: string): void {
    const pluginDir = path.join(vaultPath, '.obsidian', 'plugins', pluginName);
    const hotReloadPath = path.join(pluginDir, '.hotreload');
    if (fs.existsSync(hotReloadPath)) {
        return;
    }

    fs.writeFileSync(hotReloadPath, '');
    console.log('Created .hotreload file for hot reload support');
}

export interface VaultSelectionOptions {
    /** Prefer the remembered vault and skip the prompt entirely. */
    useDefault?: boolean;
}

/** Resolves the vault to deploy to, from `.vault`, the default, or a prompt. */
export async function selectVault(options: VaultSelectionOptions = {}): Promise<string> {
    const savedVault = loadVaultPath();

    if (options.useDefault) {
        if (savedVault) {
            console.log(`✅ Using saved vault: ${savedVault}`);
            return savedVault;
        }

        const vaults = findObsidianVaults();
        if (vaults.length === 0) {
            console.error('❌ No Obsidian vaults found.');
            process.exit(1);
        }

        console.log(`Using default vault: ${vaults[0]}`);
        return vaults[0];
    }

    console.log('🔍 Scanning for Obsidian vaults...');
    const vaults = findObsidianVaults();
    if (vaults.length === 0) {
        console.log(
            '❌ No Obsidian vaults found. Please make sure you have Obsidian installed and have opened at least one vault.',
        );
        process.exit(1);
    }

    console.log(`✅ Found ${vaults.length} vault(s):`);
    const vaultPath = await promptUser('Select a vault to copy the plugin to:', vaults, savedVault);
    saveVaultPath(vaultPath);
    return vaultPath;
}

interface PluginFile {
    name: string;
    source: string;
}

/** Copies the built plugin files into a vault's plugin directory. */
export function copyPluginToVault(vaultPath: string, pluginName: string): void {
    const pluginDir = path.join(vaultPath, '.obsidian', 'plugins', pluginName);
    fs.mkdirSync(pluginDir, { recursive: true });

    const files: readonly PluginFile[] = [
        { name: 'manifest.json', source: MANIFEST_FILE },
        { name: 'main.js', source: path.join(DIST_DIR, 'main.js') },
        { name: 'styles.css', source: path.join(DIST_DIR, 'styles.css') },
    ];

    for (const file of files) {
        if (!fs.existsSync(file.source)) {
            console.log(`Warning: ${file.name} not found`);
            continue;
        }

        const destination = path.join(pluginDir, file.name);
        fs.copyFileSync(file.source, destination);
        console.log(`Copied ${file.name} to ${destination}`);
    }

    ensureHotReloadFile(vaultPath, pluginName);
    console.log(`Plugin "${pluginName}" copied to vault: ${vaultPath}`);
}

/** Plugin folder name, taken from manifest.json. */
export function getPluginId(): string {
    const manifest = readJson(MANIFEST_FILE);
    if (!isRecord(manifest) || typeof manifest.id !== 'string') {
        throw new Error('manifest.json has no id');
    }

    return manifest.id;
}
