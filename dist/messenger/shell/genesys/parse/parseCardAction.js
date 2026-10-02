import { isRecord, readString } from '#shared';
/**
 * Reads one card button (Guest API `ContentCardAction`). Both message shapes carry the raw
 * action object.
 *
 * @param value - Untrusted: `{ type: 'Link', text, url }` or `{ type: 'Postback', text, payload }`.
 * @returns The action, or `undefined` when `type` is neither, `text` is missing or empty, a
 *   Link has no `url`, or a Postback has no `payload` (a Postback whose `payload` is missing
 *   but whose `text` is set uses `text` as the payload).
 * @remarks Pure. Does not judge the URL; rendering checks the scheme.
 */
export const parseCardAction = (value) => {
    if (!isRecord(value)) {
        return undefined;
    }
    const type = readString(value, 'type');
    const text = readString(value, 'text');
    if (!text) {
        return undefined;
    }
    if (type === 'Link') {
        const url = readString(value, 'url');
        return url ? { kind: 'Link', text, url } : undefined;
    }
    if (type === 'Postback') {
        const payload = readString(value, 'payload');
        return {
            kind: 'Postback',
            text,
            payload: payload === undefined || payload === '' ? text : payload,
        };
    }
    return undefined;
};