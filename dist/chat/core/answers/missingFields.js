import { isDateInRange } from "./isDateInRange.js";
/**
 * Finds the fields on one form page that still need an answer, following Genesys' own UI: a
 * required `Input` must be non-blank, a `DatePicker` is always required, list and wheel pickers
 * never are, and nothing checks formats (structured-messages.md, "How Genesys' UI renders it").
 *
 * @param page - The page.
 * @param values - Everything entered so far, by field id; may hold other pages' fields.
 * @returns The ids of unanswered required fields, in page order. An `Input` is unanswered when
 *   its value is missing, not `text`, or blank after trimming; a `DatePicker` when its value is
 *   missing, not a `date` with a non-empty `date`, or before the field's `min` or after its `max`
 *   (both `YYYY-MM-DD`, so they compare as strings). Genesys' own date picker can't go outside
 *   them; a typed date can.
 * @remarks Pure.
 */
export const missingFields = (page, values) => {
    return page.fields
        .filter((field) => field.kind !== 'Input' || field.required)
        .filter((field) => {
        const value = values[field.id];
        if (field.kind === 'Input') {
            return !(value?.kind === 'text' && value.text.trim() !== '');
        }
        if (field.kind === 'DatePicker') {
            return !(value?.kind === 'date' &&
                value.date !== '' &&
                isDateInRange(value.date, field.min, field.max));
        }
        return false;
    })
        .map((field) => field.id);
};