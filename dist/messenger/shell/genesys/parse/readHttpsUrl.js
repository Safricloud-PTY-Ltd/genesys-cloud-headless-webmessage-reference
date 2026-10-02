import { readString } from '#shared';
/**
 * Reads an image URL an admin configured (a logo, a launcher icon, a bot avatar).
 *
 * @param record - Where the URL lives. May be any record.
 * @param key - The field to read.
 * @returns The trimmed value when it is a string that parses (`new URL`) as an absolute `https:`
 *   URL; otherwise `undefined`. The page draws these as `<img src>`, so nothing else is let
 *   through.
 * @remarks Pure. Part of `parseLookAndFeel`; tested through it.
 */
export const readHttpsUrl = (record, key) => {
    const value = readString(record, key)?.trim();
    if (value === undefined) {
        return undefined;
    }
    // `new URL` throws on anything that is not an absolute URL, relative paths included.
    try {
        return new URL(value).protocol === 'https:' ? value : undefined;
    }
    catch {
        return undefined;
    }
};