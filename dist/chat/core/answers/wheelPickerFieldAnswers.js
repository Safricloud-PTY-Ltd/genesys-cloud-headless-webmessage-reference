/**
 * The answer entries of a `WheelPicker` form field.
 *
 * @param field - The field.
 * @param value - The customer's input on it; `undefined` when untouched.
 * @returns The first chosen id (in choice order) naming an item, as `[{ id, text: item.title, payload:
 *   item.id }]`; `[{ id, text: "", payload: "" }]` when none.
 * @remarks Pure. Part of `formFieldAnswers`; tested through `formAnswer`.
 */
export const wheelPickerFieldAnswers = (field, value) => {
    const ids = value?.kind === 'choices' ? value.ids : [];
    const item = ids
        .map((id) => field.items.find((candidate) => candidate.id === id))
        .find((candidate) => candidate !== undefined);
    return item === undefined
        ? [{ id: field.id, text: '', payload: '' }]
        : [{ id: field.id, text: item.title, payload: item.id }];
};