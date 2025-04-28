// import { listen } from '@tauri-apps/api/event';
import { getVersion } from '@tauri-apps/api/app';
import { logger } from 'matrix-js-sdk/src/logger';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { secureRandomString } from 'matrix-js-sdk/src/randomstring';
import { MatrixClient } from 'matrix-js-sdk/src/matrix';

import BasePlatform from "../../../BasePlatform";
import dis from "../../../dispatcher/dispatcher";
import SdkConfig from "../../../SdkConfig";
import { ActionPayload } from "../../../dispatcher/payloads";
// import { TauriSeshatIndexManager as SeshatIndexManager } from "./TauriSeshatIndexManager";
import { TauriIPCManager as IPCManager } from "./TauriIPCManager";
import { _t } from "../../../languageHandler";
import { TauriSeshatIndexManager } from './TauriSeshatIndexManager';
import { TauriSecureStorage } from './TauriSecureStorage';

import BaseEventIndexManager from '~tchap-web/src/indexing/BaseEventIndexManager';

const SSO_ID_KEY = "tchap-desktop-ssoid";

function onAction(payload: ActionPayload): void {
    // Whitelist payload actions, no point sending most across
    if (["call_state"].includes(payload.action)) {
        window.__TAURI__.core.invoke("app_onAction", payload);
    }
}

function platformFriendlyName(): string {
    // used to use window.process but the same info is available here
    if (navigator.userAgent.includes("Macintosh")) {
        return "macOS";
    } else if (navigator.userAgent.includes("FreeBSD")) {
        return "FreeBSD";
    } else if (navigator.userAgent.includes("OpenBSD")) {
        return "OpenBSD";
    } else if (navigator.userAgent.includes("SunOS")) {
        return "SunOS";
    } else if (navigator.userAgent.includes("Windows")) {
        return "Windows";
    } else if (navigator.userAgent.includes("Linux")) {
        return "Linux";
    } else {
        return "Unknown";
    }
}

export default class TauriPlatform extends BasePlatform {
    private readonly ipc = new IPCManager();
    private readonly eventIndexManager: BaseEventIndexManager = new TauriSeshatIndexManager(this);
    protected tauriSecureStorage: TauriSecureStorage;
    
    // this is the opaque token we pass to the HS which when we get it in our callback we can resolve to a profile
    private readonly ssoID: string = secureRandomString(32);
    public constructor(tauriSecureStorage: TauriSecureStorage) {
        super();

        if (!window.__TAURI__) {
            throw new Error("Cannot instantiate TauriPlatform, window.__TAURI__ is not set");
        }

        dis.register(onAction);
        this.tauriSecureStorage = tauriSecureStorage;

        this.ipc.call("welcome");

        // this.ipc.call("set_homeserver_url", MatrixClientPeg.get()?.getHomeserverUrl());
        // getCurrentWindow().onCloseRequested(async (event) => {
        //     logger.info("tchap-desktop closing", event);
        //     // shutdown eventindex db 
        //     this.eventIndexManager.closeEventIndex();
        //     process.exit();
        // });

        this.checkUpdates();
    }

    public async checkUpdates(): Promise<void> {
        try {

            const update = await check();
            if (update) {
                logger.info(
                    `found update ${update.version} from ${update.date} with notes ${update.body}`
                );
                let downloaded = 0;
                let contentLength = 0;
                // alternatively we could also call update.download() and update.install() separately
                await update.downloadAndInstall((event) => {
                    switch (event.event) {
                    case 'Started':
                        contentLength = event.data.contentLength ?? 0;
                        logger.info(`started downloading desktop update${contentLength} bytes`);
                        break;
                    case 'Progress':
                        downloaded += event.data.chunkLength;
                        logger.info(`downloaded ${downloaded} from ${contentLength}`);
                        break;
                    case 'Finished':
                        logger.info('download tauri update finished');
                        break;
                    }
                });
    
                logger.info('Desktop update installed');
                await relaunch();
            }
        } catch(e) {
            logger.error('Error checking for updates', e);
        }
    }

    public getSecureStorageInstance(): TauriSecureStorage {
        return this.tauriSecureStorage;
    }

    public async getPickleKey(userId: string, deviceId: string): Promise<string | null> {
        try {
            const key = `${userId}|${deviceId}`;
            // Read a record from store
            const value = await this.tauriSecureStorage?.getItem(key);

            console.log('In getpicklekey value', value);
            console.log(value); // 'secret value'

            return value ? new TextDecoder().decode(value) : null;
        } catch {
            // if we can't connect to the password storage, assume there's no
            // pickle key
            return null;
        }
    }

    public async createPickleKey(userId: string, deviceId: string): Promise<string | null> {
        try {
            const key = `${userId}|${deviceId}`;
            const value = this.tauriSecureStorage.getRandom32Bytes();
            // Insert a record to the store
            await this.tauriSecureStorage.createItem(key, Array.from(value));

            return value ? new TextDecoder().decode(value) : null;
        } catch {
            // if we can't connect to the password storage, assume there's no
            // pickle key
            return null;
        }
    }

    public async destroyPickleKey(userId: string, deviceId: string): Promise<void> {
        try {
            const key = `${userId}|${deviceId}`;
            // Remove a record from store
            await this.tauriSecureStorage.removeItem(key);
        } catch {}
    }

    public async clearStorage(): Promise<void> {
        try {
            await super.clearStorage();
            await this.ipc.call("clear_storage");
        } catch {}  
    }
      
    public getEventIndexingManager(): BaseEventIndexManager | null {
        return this.eventIndexManager;
    }
    
    public get baseUrl(): string {
        // This configuration is element-desktop specific so the types here do not know about it
        return (SdkConfig.get() as unknown as Record<string, string>)["web_base_url"] ?? "https://www.tchap.gouv.fr/";
    }


    public getSSOCallbackUrl(fragmentAfterLogin?: string): URL {
        const url = super.getSSOCallbackUrl(fragmentAfterLogin);
        url.protocol = "tchap";
        url.searchParams.set(SSO_ID_KEY, this.ssoID);
        return url;
    }

    public startSingleSignOn(
        mxClient: MatrixClient,
        loginType: "sso" | "cas",
        fragmentAfterLogin: string,
        idpId?: string,
    ): void {
        // this will get intercepted by electron-main will-navigate
        super.startSingleSignOn(mxClient, loginType, fragmentAfterLogin, idpId);
    }

    public getOidcClientState(): string {
        return `:${SSO_ID_KEY}:${this.ssoID}`;
    }


    public async getAppVersion(): Promise<string> {
        return await getVersion();
    }

    public getHumanReadableName(): string {
        return "Tauri Platform"; // no translation required: only used for analytics
    }

    public requestNotificationPermission(): Promise<string> {
        return Promise.resolve("granted");
    }


    public getDefaultDeviceDisplayName(): string {
        const brand = SdkConfig.get().brand;
        return _t("desktop_default_device_name", {
            brand,
            platformName: platformFriendlyName(),
        });
    }

    public reload(): void {
        window.location.reload();
    }
}
