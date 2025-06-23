import { Client, Store, Stronghold } from '@tauri-apps/plugin-stronghold';
import { appDataDir } from '@tauri-apps/api/path';
import { logger } from 'matrix-js-sdk/src/logger';

// Tauri secure storage - using stronghold
export class TauriSecureStorage {
    private store: Store | undefined;
    private client: Stronghold | undefined;

    public constructor() {
    }

    public getRandom32Bytes(): Uint8Array {
        return crypto.getRandomValues(new Uint8Array(32));
    }

    public getRandomUtf832Bytes(): Uint8Array{
        // Create a Uint32Array to hold the random value
        const randomValue = this.getRandom32Bytes();

        // Map to printable ASCII range (33-126: !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~)
        for (let i = 0; i < randomValue.length; i++) {
            randomValue[i] = 33 + (randomValue[i] % 94);
        }

        return randomValue;
    }

    public async getItem(key: string): Promise<any> {
        if (!this.store) return Promise.reject(new Error("No stronghold store found"));
        return this.store.get(key);
    }

    public async createItem(key: string, value: any): Promise<any> {
        if (!this.store) return Promise.reject(new Error("No stronghold store found"));

        this.store?.insert(key, Array.from(value));

        // Save your updates
        await this.client?.save();
    }

    public async removeItem(key: string): Promise<any> {
        if (!this.store) return Promise.reject(new Error("No stronghold store found"));

        return this.store?.remove(key);
    }

    // On dev build, loading the stronghold vault takes a really long time https://github.com/tauri-apps/tauri/issues/4197
    public async initStronghold(): Promise<void> {
        logger.info("[Tauri] Initializing stronghold");
        try {
            if (!this.store) {
                const vaultPath = `${await appDataDir()}/vault.hold`;
                logger.info("[Tauri] vaulpath", vaultPath);
                const vaultPassword = 'tchap-desktop-vault321';
                const stronghold = await Stronghold.load(vaultPath, vaultPassword);
                const clientName = 'tchap-desktop';
                let client: Client;
                try {
                    logger.info("[Tauri] stronghold loaded");
                    client = await stronghold.loadClient(clientName);
                } catch {
                    logger.info("[Tauri] stronghold created");
                    client = await stronghold.createClient(clientName);
                }
              
                this.store = client.getStore();
                this.client = stronghold;
            }
        } catch (err) {
            console.error("Error in init stronghold", err);
        }
    };
}