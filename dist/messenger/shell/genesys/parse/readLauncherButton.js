import { omitUndefined, readRecord, readString } from '#shared';
import { nativeLookAndFeel, } from "../../../types.js";
import { readHttpsUrl } from "./readHttpsUrl.js";
// Maps, not object literals, so a configured value such as `constructor` matches nothing.
const visibilities = new Map([
    ['on', 'On'],
    ['off', 'Off'],
    ['ondemand', 'OnDemand'],
]);
const displays = new Map([
    ['icon', 'Icon'],
    ['text', 'Text'],
    ['iconandtext', 'IconAndText'],
]);
/**
 * Reads `messenger.launcherButton`.
 *
 * @param config - The deployment config record.
 * @returns `visibility`: `visibility` matched case-insensitively against `on`, `off` and
 *   `ondemand` (→ `On`, `Off`, `OnDemand`), else `On`. `display`: `displayType` matched
 *   case-insensitively against `icon`, `text` and `iconandtext` (→ `Icon`, `Text`,
 *   `IconAndText`), else `Icon`. `iconUrl`: `icon.url` through `readHttpsUrl`, omitted when that
 *   gives nothing.
 * @remarks Pure. Part of `parseLookAndFeel`; tested through it.
 */
export const readLauncherButton = (config) => {
    const launcher = readRecord(readRecord(config, 'messenger') ?? {}, 'launcherButton') ?? {};
    const visibility = (readString(launcher, 'visibility') ?? '').toLowerCase();
    const display = (readString(launcher, 'displayType') ?? '').toLowerCase();
    return {
        visibility: visibilities.get(visibility) ?? nativeLookAndFeel.launcher.visibility,
        display: displays.get(display) ?? nativeLookAndFeel.launcher.display,
        ...omitUndefined({ iconUrl: readHttpsUrl(readRecord(launcher, 'icon') ?? {}, 'url') }),
    };
};