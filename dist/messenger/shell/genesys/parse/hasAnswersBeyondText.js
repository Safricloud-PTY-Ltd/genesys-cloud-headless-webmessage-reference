/**
 * Tells whether a customer's chosen labels say something their message's own text doesn't.
 *
 * @param text - The message's own text; `undefined` or `""` when it has none.
 * @param answers - The labels chosen, in order. May be empty.
 * @returns `true` when `text` is non-empty, `answers` is non-empty, and `answers.join(', ')`
 *   differs from `text`; otherwise `false`.
 * @remarks Pure. Part of `messageExtras`; tested through the message parsers.
 */
export const hasAnswersBeyondText = (text, answers) => text !== undefined && text !== '' && answers.length > 0 && answers.join(', ') !== text;