import { toSafeUrl } from "./toSafeUrl.js";
// Tried in order; `prefix` turns the typed text into an absolute href.
const autolinkPatterns = [
    { pattern: /^https?:\/\/[^\s<]+/, prefix: '' },
    { pattern: /^www\.[^\s<]+/, prefix: 'http://' },
    { pattern: /^[\w.%+-]+@[\w-]+(?:\.[\w-]+)+/, prefix: 'mailto:' },
];
/**
 * Matches a bare URL or email address, which Genesys links whether or not markdown is on.
 *
 * @param text - The whole message text.
 * @param at - Where the construct would start; an index into `text`, 0 ≤ `at` < length.
 * @returns A `leaf` link node whose single text child is the matched text, for: `https://` or
 *   `http://` followed by at least one character; `www.` followed by at least one character
 *   (`href` prefixed `http://`); or an email `local@domain.tld` (`href` prefixed `mailto:`).
 *   A URL runs to the next whitespace or `<`, then drops trailing `.,:;!?'"` and a trailing
 *   `)` that has no `(` inside the URL. Only matches when `at` is 0 or `text[at - 1]` is not a
 *   letter, digit, `/`, `.` or `@`. `undefined` otherwise, and when `toSafeUrl` rejects the
 *   href.
 * @remarks Pure.
 */
export const matchAutolink = (text, at) => {
    // charAt(-1) is '', so a match at the start of the text passes this check.
    if (/[A-Za-z0-9/.@]/.test(text.charAt(at - 1)))
        return undefined;
    const rest = text.slice(at);
    const found = autolinkPatterns
        .map(({ pattern, prefix }) => ({ raw: pattern.exec(rest)?.[0], prefix }))
        .find((candidate) => candidate.raw !== undefined);
    if (found?.raw === undefined)
        return undefined;
    // A `)` closes the sentence's parenthesis unless the URL opened one itself, as Wikipedia's do.
    const url = found.raw.replace(found.raw.includes('(') ? /[.,:;!?'"]+$/ : /[.,:;!?'")]+$/, '');
    const href = toSafeUrl(`${found.prefix}${url}`, ['https:', 'http:', 'mailto:']);
    if (href === undefined)
        return undefined;
    return {
        kind: 'leaf',
        node: { kind: 'link', href, children: [{ kind: 'text', text: url }] },
        end: at + url.length,
    };
};