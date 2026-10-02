import { isRecord, readArray } from '#shared';
/**
 * Reads a carousel's cards, in either message shape.
 *
 * @param value - Untrusted: `{ cards: [...] }`.
 * @param parseCard - `parseRawCard` or `parseFormattedCard`.
 * @returns The cards `parseCard` accepts, in order; `undefined` when `value` is not a record,
 *   `cards` is not an array, or no card survives.
 * @remarks Pure. Part of the content parsers; tested through them.
 */
export const parseCarousel = (value, parseCard) => {
    if (!isRecord(value))
        return undefined;
    const cards = readArray(value, 'cards')
        .map((card) => parseCard(card))
        .filter((card) => card !== undefined);
    return cards.length === 0 ? undefined : cards;
};