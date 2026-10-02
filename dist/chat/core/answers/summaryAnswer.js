import { formFieldAnswers } from "./formFieldAnswers.js";
/**
 * How one form field's answer reads on the form's summary page.
 *
 * @param field - The field.
 * @param value - The customer's input on it; `undefined` when untouched.
 * @returns `Input` with a `text` value → the text, trimmed; `DatePicker` with a `date` value →
 *   `formatFormDate(date, displayFormat)`; `ListPicker` with a `choices` value → the titles of the
 *   chosen items that exist, in the field's item order across sections, joined with `", "`;
 *   `WheelPicker` with a `choices` value → the title of the first chosen id naming an item.
 *   `undefined` when there is no value, the value's kind doesn't fit the field, or the result
 *   would be empty.
 * @remarks Pure. Derived from `formFieldAnswers(field, value)`: its non-empty texts joined with
 *   `", "`, so the summary and the sent answer can never disagree.
 */
export const summaryAnswer = (field, value) => {
    const texts = formFieldAnswers(field, value)
        .map((answer) => answer.text)
        .filter((text) => text !== '');
    return texts.length === 0 ? undefined : texts.join(', ');
};