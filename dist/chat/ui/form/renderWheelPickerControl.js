/**
 * Builds the control of a `WheelPicker` form field.
 *
 * @param field - The field.
 * @param options - Document, current value, id prefix and change callback.
 * @returns A `<select>` with id `idPrefix` + field id, an empty first option, then one option per
 *   item (`value` = id, text = title), the first id of a `choices` FormValue selected; its `change`
 *   events call `onChange({ kind: 'choices', ids: value ? [value] : [] })`.
 * @remarks Part of `renderFormField`; tested through it.
 */
export const renderWheelPickerControl = (field, options) => {
    const { document, value, onChange } = options;
    const select = document.createElement('select');
    select.id = options.idPrefix + field.id;
    const items = field.items.map((item) => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.title;
        return option;
    });
    select.append(document.createElement('option'), ...items);
    select.value = value?.kind === 'choices' ? (value.ids[0] ?? '') : '';
    select.addEventListener('change', () => {
        onChange({ kind: 'choices', ids: select.value === '' ? [] : [select.value] });
    });
    return select;
};