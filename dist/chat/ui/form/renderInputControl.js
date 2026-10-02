/**
 * Builds the control of an `Input` form field.
 *
 * @param field - The field.
 * @param options - Document, current value, id prefix and change callback (`invalid` is not read here).
 * @returns An `<input>`, or a `<textarea>` when `multiline`, with id `idPrefix` + field id, the
 *   placeholder when given, `required` when the field is, and the value of a `text` FormValue; its
 *   `input` events call `onChange({ kind: 'text', text })`.
 * @remarks Part of `renderFormField`; tested through it.
 */
export const renderInputControl = (field, options) => {
    const control = field.multiline
        ? options.document.createElement('textarea')
        : options.document.createElement('input');
    control.id = options.idPrefix + field.id;
    control.required = field.required;
    if (field.placeholder !== undefined) {
        control.placeholder = field.placeholder;
    }
    control.value = options.value?.kind === 'text' ? options.value.text : '';
    control.addEventListener('input', () => {
        options.onChange({ kind: 'text', text: control.value });
    });
    return control;
};