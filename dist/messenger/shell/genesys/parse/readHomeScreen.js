import { omitUndefined, readBoolean, readRecord } from '#shared';
import { readHttpsUrl } from "./readHttpsUrl.js";
/**
 * Reads `messenger.homeScreen`.
 *
 * @param config - The deployment config record.
 * @returns `enabled`: `true` only when `messenger.homeScreen.enabled` is `true`. `logoUrl`:
 *   `messenger.homeScreen.logoUrl` through `readHttpsUrl`, omitted when that gives nothing.
 * @remarks Pure. Part of `parseLookAndFeel`; tested through it.
 */
export const readHomeScreen = (config) => {
    const homeScreen = readRecord(readRecord(config, 'messenger') ?? {}, 'homeScreen') ?? {};
    return {
        enabled: readBoolean(homeScreen, 'enabled') === true,
        ...omitUndefined({ logoUrl: readHttpsUrl(homeScreen, 'logoUrl') }),
    };
};