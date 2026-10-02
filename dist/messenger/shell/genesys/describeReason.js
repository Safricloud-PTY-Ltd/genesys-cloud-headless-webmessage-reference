import { isRecord, readRecord, readString } from '#shared';
/**
 * The known-field half of `describeReason`: an `Error`'s message, the string itself,
 * `body.errorMessage`, a string `body`, a top-level `message` string, in that order.
 *
 * @param reason - Anything.
 * @returns The first that applies, as found (possibly empty); `undefined` when none does.
 */
const readReasonMessage = (reason) => {
    const record = isRecord(reason) ? reason : {};
    return [
        reason instanceof Error ? reason.message : undefined,
        typeof reason === 'string' ? reason : undefined,
        readString({ ...readRecord(record, 'body') }, 'errorMessage'),
        readString(record, 'body'),
        readString(record, 'message'),
    ].find((candidate) => candidate !== undefined);
};
/**
 * The fallback half of `describeReason`.
 *
 * @param reason - Anything, including circular objects, bigints and symbols.
 * @returns `JSON.stringify(reason)`, or `String(reason)` when that throws or yields `undefined`.
 */
const stringifyReason = (reason) => {
    try {
        // The lib types say `string`, but undefined, symbols and `toJSON() => undefined` yield undefined.
        const json = JSON.stringify(reason);
        return typeof json === 'string' ? json : String(reason);
    }
    catch {
        return String(reason);
    }
};
/**
 * Turns whatever the SDK rejected or published as an error into one line of text for a
 * notice or the console.
 *
 * @param reason - A rejection value: an `Error`, a string, a Guest API error frame
 *   (`{ body: { errorMessage } }` or `{ body: "text" }`), or anything else.
 * @returns In order of preference: an `Error`'s `message`; the string itself; the frame's
 *   `body.errorMessage`; a string `body`; a top-level `message` string; otherwise
 *   `JSON.stringify(reason)`, or `String(reason)` when that fails or yields `undefined`.
 *   Never empty: an empty result, or `{}` (what the SDK publishes when it has nothing to say),
 *   becomes `"Unknown error"`.
 * @remarks Pure. Never throws, even for circular objects.
 */
export const describeReason = (reason) => {
    const message = readReasonMessage(reason);
    const text = message ?? stringifyReason(reason);
    // Only the JSON fallback's `{}` means "nothing to say"; a string reason of `{}` is someone's text.
    return text === '' || (message === undefined && text === '{}') ? 'Unknown error' : text;
};