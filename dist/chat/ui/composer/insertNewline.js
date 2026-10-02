/**
 * Types a line break into a text field where the caret is, replacing any selection.
 *
 * @param field - The textarea.
 * @remarks Replaces `selectionStart`–`selectionEnd` with `'\n'` and leaves the caret just after
 *   it, by setting `value` and `setSelectionRange`. Dispatches no event. Part of `<chat-composer>`; tested
 *   through it.
 */
export const insertNewline = (field) => {
    // Not setRangeText: happy-dom 20 puts its 'end' caret at the field's length, not after the text.
    const { selectionStart: start, selectionEnd: end, value } = field;
    field.value = `${value.slice(0, start)}\n${value.slice(end)}`;
    field.setSelectionRange(start + 1, start + 1);
};