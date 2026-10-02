import { isRecord, readArray, readRecord, readString } from '#shared';
import { parseCardAction } from "./parseCardAction.js";
/**
 * Reads a raw Guest API card (`content[].card`, or one of `content[].carousel.cards`).
 *
 * @param value - Untrusted: `{ title, description?, image?, defaultAction?, actions[] }`.
 * @returns The card, or `undefined` when `title` is missing or empty. Actions that
 *   `parseCardAction` rejects are dropped; order is kept. `defaultAction` goes through `parseCardAction`
 *   with a missing or empty `text` filled from its `url` first: a default action is never shown as
 *   a button, and Genesys' own example has no text (structured-messages.md); it is omitted when it
 *   still fails.
 * @remarks Pure.
 */
export const parseRawCard = (value) => {
    if (!isRecord(value)) {
        return undefined;
    }
    const title = readString(value, 'title');
    if (!title) {
        return undefined;
    }
    const description = readString(value, 'description');
    const image = readString(value, 'image');
    const rawDefault = readRecord(value, 'defaultAction') ?? {};
    const defaultAction = parseCardAction(readString(rawDefault, 'text')
        ? rawDefault
        : { ...rawDefault, text: readString(rawDefault, 'url') });
    const actions = readArray(value, 'actions')
        .map((action) => parseCardAction(action))
        .filter((action) => action !== undefined);
    return {
        title,
        ...(description ? { description } : {}),
        ...(image ? { image } : {}),
        ...(defaultAction ? { defaultAction } : {}),
        actions,
    };
};