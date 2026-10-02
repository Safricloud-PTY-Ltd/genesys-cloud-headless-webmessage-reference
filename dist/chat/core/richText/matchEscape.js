const asciiPunctuation = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';
/**
 * Matches a backslash escape: `\` followed by one ASCII punctuation character.
 *
 * @param text - The whole message text.
 * @param at - Where the construct would start; an index into `text`, 0 ≤ `at` < length.
 * @returns A `leaf` text node holding the punctuation character alone, ending after it; `undefined` when `text[at]` is not a backslash or the next character is not ASCII punctuation (``!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~``).
 * @remarks Pure.
 */
export const matchEscape = (text, at) => {
    const escaped = text.charAt(at + 1);
    if (text.charAt(at) !== '\\' || escaped === '' || !asciiPunctuation.includes(escaped)) {
        return undefined;
    }
    return { kind: 'leaf', node: { kind: 'text', text: escaped }, end: at + 2 };
};