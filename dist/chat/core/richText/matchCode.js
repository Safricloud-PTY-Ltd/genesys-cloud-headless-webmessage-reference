/**
 * Matches inline code and code blocks. Their content is literal, so code shows exactly what was
 * typed: unlike Genesys' own UI, no markdown is parsed inside code (rich-text.md, "Where this
 * reference differs").
 *
 * @param text - The whole message text.
 * @param at - Where the construct would start; an index into `text`, 0 ≤ `at` < length.
 * @returns For three backticks: a `codeBlock` leaf with everything up to the next three backticks
 *   (newlines kept), ending after them; `undefined` when there is no closing run or the content
 *   is empty. For one backtick not followed by another: a `code` leaf with everything up to the
 *   next backtick on the same line, with one leading and one trailing space removed when both are
 *   present; `undefined` when no closing backtick precedes the next newline or the content is
 *   empty. Two backticks match nothing.
 * @remarks Pure.
 */
export const matchCode = (text, at) => {
    const rest = text.slice(at);
    const block = /^```([\s\S]*?)```/.exec(rest)?.[1];
    if (block) {
        return { kind: 'leaf', node: { kind: 'codeBlock', text: block }, end: at + block.length + 6 };
    }
    // An empty or unclosed block falls through: the inline pattern then sees two backticks with
    // nothing between them, which is empty content and matches nothing.
    const inline = /^`([^`\n]*)`/.exec(rest)?.[1];
    return inline
        ? {
            kind: 'leaf',
            node: { kind: 'code', text: inline.replace(/^ ([\s\S]+) $/, '$1') },
            end: at + inline.length + 2,
        }
        : undefined;
};