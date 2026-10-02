import { matchAutolink } from "./matchAutolink.js";
import { matchCode } from "./matchCode.js";
import { matchDelimited } from "./matchDelimited.js";
import { matchEmphasis } from "./matchEmphasis.js";
import { matchEscape } from "./matchEscape.js";
import { matchLink } from "./matchLink.js";
/**
 * Finds the rich-text construct starting exactly at a position, trying each matcher in priority
 * order.
 *
 * @param text - The whole message text.
 * @param at - The position to try.
 * @param options - With `markdown` off, only `matchEscape` and `matchAutolink` are tried (what
 *   Genesys' UI does with Rich Text Formatting off). `==` is tried only for `Outbound` text.
 * @returns The first match of: `matchEscape`, `matchCode`, `matchLink`, `matchAutolink`,
 *   `matchDelimited` with `*`, then `~`, then `==`, then `matchEmphasis`; or `undefined`.
 * @remarks Pure.
 */
export const matchInline = (text, at, options) => {
    const inPriorityOrder = options.markdown
        ? [
            () => matchEscape(text, at),
            () => matchCode(text, at),
            () => matchLink(text, at),
            () => matchAutolink(text, at),
            () => matchDelimited(text, at, '*'),
            () => matchDelimited(text, at, '~'),
            ...(options.direction === 'Outbound' ? [() => matchDelimited(text, at, '==')] : []),
            () => matchEmphasis(text, at),
        ]
        : [() => matchEscape(text, at), () => matchAutolink(text, at)];
    // Thunks keep it lazy: once one matcher hits, `??` stops calling the rest.
    return inPriorityOrder.reduce((found, match) => found ?? match(), undefined);
};