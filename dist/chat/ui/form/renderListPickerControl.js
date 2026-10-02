/**
 * Builds the control of a `ListPicker` form field: a group of groups.
 *
 * @param field - The field.
 * @param options - Document, current value, id prefix and change callback.
 * @returns An outer `<fieldset>` with id `idPrefix` + field id and a `<legend>` holding the title;
 *   inside, per section, a `<fieldset>` whose `<legend>` is the section title, holding one radio
 *   (single choice) or checkbox (multiple) per item, each wrapped in a `<label>` with the item title,
 *   `value` = item id, checked when in a `choices` FormValue. Radios of one section share the name
 *   `idPrefix` + field id + `-` + section index. Any `change` calls `onChange({ kind: 'choices', ids })`
 *   with every checked id in the field, in document order.
 * @remarks Part of `renderFormField`; tested through it.
 */
export const renderListPickerControl = (field, options) => {
    const { document, idPrefix, value, onChange } = options;
    const chosen = value?.kind === 'choices' ? value.ids : [];
    const fieldset = document.createElement('fieldset');
    fieldset.id = idPrefix + field.id;
    const legend = document.createElement('legend');
    legend.textContent = field.title;
    const groups = field.sections.map((section, index) => {
        const group = document.createElement('fieldset');
        const caption = document.createElement('legend');
        caption.textContent = section.title;
        const labels = section.items.map((item) => {
            const input = document.createElement('input');
            input.type = section.multipleSelection ? 'checkbox' : 'radio';
            input.name = `${idPrefix}${field.id}-${String(index)}`;
            input.value = item.id;
            input.checked = chosen.includes(item.id);
            const label = document.createElement('label');
            label.append(input, item.title);
            return label;
        });
        group.append(caption, ...labels);
        return group;
    });
    fieldset.append(legend, ...groups);
    fieldset.addEventListener('change', () => {
        const inputs = [...fieldset.querySelectorAll('input')];
        onChange({ kind: 'choices', ids: inputs.filter((i) => i.checked).map((i) => i.value) });
    });
    return fieldset;
};