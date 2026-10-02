import { isRecord, readString } from '#shared';
/**
 * Reads one quick reply, in either message shape.
 *
 * @param value - Untrusted: `{ text, payload?, image? }` (raw) or `{ text, payload?, imageUrl? }`
 *   (formatted).
 * @param imageKey - Where the image URL is: `image` for raw, `imageUrl` for formatted.
 * @returns The quick reply: non-empty `text` required, `payload` defaulting to `text`, and the
 *   non-empty string at `imageKey` as `image`; `undefined` when `value` is not a record or has no
 *   non-empty `text`.
 * @remarks Pure. Part of the content parsers; tested through them.
 */
export const parseQuickReply = (value, imageKey) => {
    if (!isRecord(value))
        return undefined;
    const text = readString(value, 'text');
    if (!text)
        return undefined;
    const image = readString(value, imageKey);
    return { text, payload: readString(value, 'payload') ?? text, ...(image ? { image } : {}) };
};