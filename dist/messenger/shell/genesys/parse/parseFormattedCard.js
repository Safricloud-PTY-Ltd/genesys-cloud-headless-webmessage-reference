import { isRecord, readArray, readRecord, readString } from '#shared';
import { parseCardAction } from "./parseCardAction.js";
/**
 * Reads a card in the SDK's formatted shape (`card`, or one of `carousel.cards`), where the
 * field names don't mean what they say (docs/guides/sdk-source-notes.md): the buttons are in
 * `buttons`, and `actions` holds the default action — an object — or, when there was none,
 * a copy of the buttons array.
 *
 * @param value - Untrusted: `{ id, title, description, imageUrl, actions, buttons }`. An empty
 *   object (`card: {}`) means "no card".
 * @returns The card with `imageUrl` → `image`, `buttons` → `actions` (each through
 *   `parseCardAction`), and `actions` → `defaultAction` only when it is a single object (read like
 *   `parseRawCard` reads one: a missing or empty `text` is filled from its `url`); or
 *   `undefined` when `title` is missing or empty. Empty `description`/`imageUrl` are omitted.
 * @remarks Pure.
 */
export const parseFormattedCard = (value) => {
    if (!isRecord(value)) {
        return undefined;
    }
    const title = readString(value, 'title');
    if (!title) {
        return undefined;
    }
    const description = readString(value, 'description');
    const image = readString(value, 'imageUrl');
    // readRecord rejects arrays, so the copied buttons array yields no default action.
    const rawDefault = readRecord(value, 'actions') ?? {};
    const defaultAction = parseCardAction(readString(rawDefault, 'text')
        ? rawDefault
        : { ...rawDefault, text: readString(rawDefault, 'url') });
    const actions = readArray(value, 'buttons')
        .map((button) => parseCardAction(button))
        .filter((button) => button !== undefined);
    return {
        title,
        ...(description ? { description } : {}),
        ...(image ? { image } : {}),
        ...(defaultAction ? { defaultAction } : {}),
        actions,
    };
};