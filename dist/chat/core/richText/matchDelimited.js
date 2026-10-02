// The lazy `[^\\]` stops at the first closer whose preceding character is not a backslash.
const PATTERNS = {
    '*': /^\*(?![\s*])([\s\S]*?[^\\])\*/,
    '~': /^~(?![\s~])([\s\S]*?[^\\])~/,
    '==': /^==(?![\s=])([\s\S]*?[^\\])==/,
};
const WRAPS = { '*': 'strong', '~': 's', '==': 'mark' };
/**
 * Matches text wrapped in a delimiter: `*bold*`, `~strike~` or `==highlight==`. Genesys' own
 * UI uses single `*` and `~`, not `**` and `~~` (rich-text.md).
 *
 * @param text - The whole message text.
 * @param at - Where the opening delimiter would start.
 * @param delimiter - `*`, `~` or `==`.
 * @returns A `wrap` match (`*` → `strong`, `~` → `s`, `==` → `mark`) with `inner` = the
 *   text between the delimiters, ending after the closing one. The opening delimiter must not be
 *   followed by whitespace or by the delimiter's own character; the closing one is the next
 *   occurrence not preceded by a backslash, and must not be preceded by whitespace. `undefined`
 *   when there is no such closing delimiter or `inner` would be empty. May span newlines.
 * @remarks Pure. Unlike Genesys' UI, `5 * 3 * 2` stays literal: whitespace inside the opening
 *   delimiter disqualifies it, so arithmetic is not bolded (rich-text.md, "Where this reference
 *   differs").
 */
export const matchDelimited = (text, at, delimiter) => {
    const [whole, inner] = PATTERNS[delimiter].exec(text.slice(at)) ?? [];
    if (whole === undefined || inner === undefined || /\s$/.test(inner))
        return undefined;
    return { kind: 'wrap', wrap: WRAPS[delimiter], inner, end: at + whole.length };
};