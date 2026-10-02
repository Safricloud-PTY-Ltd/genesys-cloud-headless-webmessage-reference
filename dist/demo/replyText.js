import { isRecord, readRecord, readString } from '#shared';
/**
 * What the demo bot should answer to a `sendMessage` call.
 *
 * @param options - The `sendMessage` options, untrusted.
 * @returns `options.message` when a string; else `options.postback.payload` when a string; else
 *   `''` (the menu).
 * @remarks Pure. Part of `startDemoBot`; tested through it.
 */
export const replyText = (options) => {
    if (!isRecord(options))
        return '';
    return (readString(options, 'message') ??
        readString(readRecord(options, 'postback') ?? {}, 'payload') ??
        '');
};