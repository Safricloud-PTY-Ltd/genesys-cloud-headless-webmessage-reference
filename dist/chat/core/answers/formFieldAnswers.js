import { datePickerFieldAnswers } from "./datePickerFieldAnswers.js";
import { inputFieldAnswers } from "./inputFieldAnswers.js";
import { listPickerFieldAnswers } from "./listPickerFieldAnswers.js";
import { wheelPickerFieldAnswers } from "./wheelPickerFieldAnswers.js";
/**
 * The `formData` entries one form field contributes to a form answer, per kind, as `formAnswer`
 * describes them.
 *
 * @param field - The field.
 * @param value - The customer's input on it; `undefined` when untouched.
 * @returns `Input` → `[{ id, text, payload: text }]` with the text trimmed, or `[]` when it is blank
 *   or not a `text` value; `DatePicker` → `[{ id, text: formatFormDate(date, displayFormat),
 *   payload: date + "T00:00:00.000Z" }]`, or `[]` without a `date` value; `ListPicker` → one
 *   `{ id, text: item.title, payload: item.id }` per chosen item that exists, in the field's item
 *   order across sections, or `[{ id, text: "", payload: "" }]` when none; `WheelPicker` → the first
 *   chosen id (in choice order) naming an item, as `{ id, text: item.title, payload: item.id }`, or
 *   `[{ id, text: "", payload: "" }]`.
 * @remarks Pure. Part of `formAnswer`; tested through it.
 */
export const formFieldAnswers = (field, value) => {
    switch (field.kind) {
        case 'Input':
            return inputFieldAnswers(field, value);
        case 'DatePicker':
            return datePickerFieldAnswers(field, value);
        case 'ListPicker':
            return listPickerFieldAnswers(field, value);
        case 'WheelPicker':
            return wheelPickerFieldAnswers(field, value);
    }
};