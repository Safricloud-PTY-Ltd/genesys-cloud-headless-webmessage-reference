import { omitUndefined, readBoolean, readRecord, readString } from '#shared';
import { readHttpsUrl } from "./readHttpsUrl.js";
/**
 * Reads `messenger.apps.conversations.humanize`: whether agents show with avatars and names.
 *
 * @param config - The deployment config record.
 * @returns `enabled`: `true` only when `humanize.enabled` is `true`. `botName`: `humanize.bot.name`
 *   when a non-blank string, trimmed. `botAvatarUrl`: `humanize.bot.avatarUrl` through
 *   `readHttpsUrl`. Absent values are omitted.
 * @remarks Pure. Part of `parseLookAndFeel`; tested through it.
 */
export const readHumanize = (config) => {
    const apps = readRecord(readRecord(config, 'messenger') ?? {}, 'apps') ?? {};
    const conversations = readRecord(apps, 'conversations') ?? {};
    const humanize = readRecord(conversations, 'humanize') ?? {};
    const bot = readRecord(humanize, 'bot') ?? {};
    const botName = readString(bot, 'name')?.trim();
    return {
        enabled: readBoolean(humanize, 'enabled') === true,
        ...omitUndefined({
            botName: botName === '' ? undefined : botName,
            botAvatarUrl: readHttpsUrl(bot, 'avatarUrl'),
        }),
    };
};