/**
 * The answer entries of a `ListPicker` form field.
 *
 * @param field - The field.
 * @param value - The customer's input on it; `undefined` when untouched.
 * @returns One `{ id, text: item.title, payload: item.id }` per chosen item that exists, in the field's
 *   item order across sections; `[{ id, text: "", payload: "" }]` when none.
 * @remarks Pure. Part of `formFieldAnswers`; tested through `formAnswer`.
 */
export const listPickerFieldAnswers = (field, value) => {
    const ids = value?.kind === 'choices' ? value.ids : [];
    const chosen = field.sections
        .flatMap((section) => section.items)
        .filter((item) => ids.includes(item.id))
        .map((item) => ({ id: field.id, text: item.title, payload: item.id }));
    return chosen.length > 0 ? chosen : [{ id: field.id, text: '', payload: '' }];
};