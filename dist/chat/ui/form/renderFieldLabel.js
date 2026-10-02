/**
 * Builds the label of a form field that has a single control.
 *
 * @param field - Any field but a list picker (a group is named by its `<legend>`).
 * @param options - Document and id prefix.
 * @returns A `<label for>` naming `idPrefix` + field id, holding the title followed by " *" when the
 *   field is a required `Input` or a `DatePicker`.
 * @remarks Part of `renderFormField`; tested through it.
 */
export const renderFieldLabel = (field, options) => {
    const label = options.document.createElement('label');
    label.htmlFor = options.idPrefix + field.id;
    const required = field.kind === 'DatePicker' || (field.kind === 'Input' && field.required);
    label.textContent = required ? `${field.title} *` : field.title;
    return label;
};