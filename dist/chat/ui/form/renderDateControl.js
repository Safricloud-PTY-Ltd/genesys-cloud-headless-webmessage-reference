/**
 * Builds the control of a `DatePicker` form field.
 *
 * @param field - The field.
 * @param options - Document, current value, id prefix and change callback.
 * @returns An `<input type="date">` with id `idPrefix` + field id, always `required`, `min`/`max` only
 *   when given, and the value of a `date` FormValue; its `change` events call
 *   `onChange({ kind: 'date', date })`.
 * @remarks Part of `renderFormField`; tested through it.
 */
export const renderDateControl = (field, options) => {
    const control = options.document.createElement('input');
    control.type = 'date';
    control.id = options.idPrefix + field.id;
    control.required = true;
    if (field.min !== undefined) {
        control.min = field.min;
    }
    if (field.max !== undefined) {
        control.max = field.max;
    }
    control.value = options.value?.kind === 'date' ? options.value.date : '';
    control.addEventListener('change', () => {
        options.onChange({ kind: 'date', date: control.value });
    });
    return control;
};