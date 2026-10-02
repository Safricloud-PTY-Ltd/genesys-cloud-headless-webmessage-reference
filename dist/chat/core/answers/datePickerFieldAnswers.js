import { formatFormDate } from "./formatFormDate.js";
/**
 * The answer entries of a `DatePicker` form field.
 *
 * @param field - The field.
 * @param value - The customer's input on it; `undefined` when untouched.
 * @returns `[{ id, text: formatFormDate(date, displayFormat), payload: date + "T00:00:00.000Z" }]`; `[]`
 *   without a non-empty `date` value.
 * @remarks Pure. Part of `formFieldAnswers`; tested through `formAnswer`.
 */
export const datePickerFieldAnswers = (field, value) => {
    return value?.kind === 'date' && value.date !== ''
        ? [
            {
                id: field.id,
                text: formatFormDate(value.date, field.displayFormat),
                payload: `${value.date}T00:00:00.000Z`,
            },
        ]
        : [];
};