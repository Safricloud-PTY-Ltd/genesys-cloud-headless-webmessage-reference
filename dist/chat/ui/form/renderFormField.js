import { describeFormControl } from "./describeFormControl.js";
import { renderDateControl } from "./renderDateControl.js";
import { renderFieldLabel } from "./renderFieldLabel.js";
import { renderInputControl } from "./renderInputControl.js";
import { renderListPickerControl } from "./renderListPickerControl.js";
import { renderWheelPickerControl } from "./renderWheelPickerControl.js";
/**
 * Builds the control for one form field, labelled and accessible.
 *
 * @param field - The field.
 * @param options - Document, current value, invalid flag, id prefix and change callback.
 * @returns A `<div class="field">` holding a `<label for>` with the title (plus " *" when
 *   required, and the subtitle as a description wired with `aria-describedby`) and: for `Input`, an
 *   `<input>` or, when `multiline`, a `<textarea>`, with the placeholder and `required`; for
 *   `DatePicker`, an `<input type="date">` with `min`/`max`, required; for `ListPicker`, instead
 *   of the `<label>`, a `<fieldset>` (the control, with id `idPrefix` + field id) whose `<legend>`
 *   holds the title, then per section a nested `<fieldset>` with the section title as its
 *   `<legend>` and one labelled checkbox (multiple selection) or radio (single) per item; for
 *   `WheelPicker`, a `<select>` with an empty
 *   first option. Changes call `onChange` with a `text`, `date` or `choices` value. When
 *   `invalid`, the control has `aria-invalid="true"` and `strings.formRequired` is shown and
 *   referenced by `aria-describedby`. Element ids are `idPrefix` + the field id.
 * @remarks Sets no `innerHTML`.
 */
export const renderFormField = (field, options) => {
    const control = field.kind === 'Input'
        ? renderInputControl(field, options)
        : field.kind === 'DatePicker'
            ? renderDateControl(field, options)
            : field.kind === 'ListPicker'
                ? renderListPickerControl(field, options)
                : renderWheelPickerControl(field, options);
    const label = field.kind === 'ListPicker' ? [] : [renderFieldLabel(field, options)];
    const root = options.document.createElement('div');
    root.className = 'field';
    root.append(...label, control, ...describeFormControl(field, options, control));
    return root;
};