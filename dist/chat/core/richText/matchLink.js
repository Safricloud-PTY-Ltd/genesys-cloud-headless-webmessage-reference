import { toSafeUrl } from "./toSafeUrl.js";
/**
 * Matches a markdown link `[text](url)` or `[text](url "title")`.
 *
 * @param text - The whole message text.
 * @param at - Where the construct would start; an index into `text`, 0 ≤ `at` < length.
 * @returns A `link` match with `inner` = the bracket text, `href` = `toSafeUrl(url, ['https:', 'http:',
 *   'mailto:'])` (absent when unsafe), `title` when given in double quotes, ending after `)`.
 *   `undefined` when `text[at]` is not `[`, the bracket text is empty or contains a newline,
 *   `]` is not immediately followed by `(`, or the parentheses don't close on the same line.
 *   The URL is the text up to the first space or `)`.
 * @remarks Pure.
 */
export const matchLink = (text, at) => {
    const found = /^\[([^\]\n]+)\]\(([^\s)]+)(?: "([^"\n]*)")?\)/.exec(text.slice(at));
    if (!found)
        return undefined;
    // Both groups are required by the pattern; the defaults only satisfy noUncheckedIndexedAccess.
    const [whole, inner = '', url = '', title] = found;
    const href = toSafeUrl(url, ['https:', 'http:', 'mailto:']);
    return {
        kind: 'link',
        ...(href === undefined ? {} : { href }),
        ...(title === undefined ? {} : { title }),
        inner,
        end: at + whole.length,
    };
};