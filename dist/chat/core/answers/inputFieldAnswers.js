/**
 * The answer entries of an `Input` form field.
 *
 * @param field - The field.
 * @param value - The customer's input on it; `undefined` when untouched.
 * @returns `[{ id, text, payload: text }]` with the text trimmed; `[]` when blank or not a `text` value.
 * @remarks Pure. Part of `formFieldAnswers`; tested through `formAnswer`.
 */
export const inputFieldAnswers = (field, value) => {
    const text = value?.kind === 'text' ? value.text.trim() : '';
    return text === '' ? [] : [{ id: field.id, text, payload: text }];
};