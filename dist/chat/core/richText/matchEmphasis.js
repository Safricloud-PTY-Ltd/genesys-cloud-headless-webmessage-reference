const WORD_BEFORE = /[\p{L}\p{N}]$/u;
const EMPHASIS = /^_(?![\s_])([^\r\n]*?\S)_(?![\p{L}\p{N}])/u;
/**
 * Matches `_italic_`, with Genesys' word-boundary rule so `snake_case` and emails stay intact.
 *
 * @param text - The whole message text.
 * @param at - Where the construct would start; an index into `text`, 0 ≤ `at` < length.
 * @returns An `em` `wrap` match with `inner` = the text between the underscores, ending after the
 *   closing one, when: `text[at]` is `_`; the character before `at` (if any) is not a letter or
 *   digit; the next character is not whitespace or `_`; and a closing `_` follows on the same
 *   line that is not preceded by whitespace and not followed by a letter or digit. Letters and
 *   digits are Unicode (`\p{L}`, `\p{N}`). `undefined` otherwise.
 * @remarks Pure.
 */
export const matchEmphasis = (text, at) => {
    const [whole, inner] = EMPHASIS.exec(text.slice(at)) ?? [];
    if (whole === undefined || inner === undefined || WORD_BEFORE.test(text.slice(0, at))) {
        return undefined;
    }
    return { kind: 'wrap', wrap: 'em', inner, end: at + whole.length };
};