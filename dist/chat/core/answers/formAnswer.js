import { err, ok } from '#shared';
import { formFieldAnswers } from "./formFieldAnswers.js";
import { missingFields } from "./missingFields.js";
/**
 * Builds the answer to a whole form, field by field the way Genesys' own UI does
 * (structured-messages.md, "What Genesys' UI puts in formData").
 *
 * @param messageId - The outbound message carrying the form.
 * @param form - The form; its `replyText` and `cannedResponseId` go into the answer.
 * @param values - Everything entered, by field id.
 * @returns A `form` postback whose `formData` follows page and field order:
 *   `Input` → `{ id, text, payload: text }` with the text trimmed, only when non-blank;
 *   `DatePicker` → `{ id, text: formatFormDate(date, displayFormat), payload: date +
 *   "T00:00:00.000Z" }`; `ListPicker` → one `{ id, text: item.title, payload: item.id }` per
 *   chosen item that exists, in the field's item order, or `{ id, text: "", payload: "" }` when none;
 *   `WheelPicker` → `{ id, text: item.title, payload: item.id }` for the first chosen item that
 *   exists, or `{ id, text: "", payload: "" }`.
 * @errors FormIncomplete - when `missingFields` finds anything on any page, carrying every such
 *   id in page order.
 * @remarks Pure.
 */
export const formAnswer = (messageId, form, values) => {
    const missing = form.pages.flatMap((page) => missingFields(page, values));
    if (missing.length > 0) {
        return err({ kind: 'FormIncomplete', fieldIds: missing });
    }
    return ok({
        kind: 'form',
        messageId,
        text: form.replyText,
        cannedResponseId: form.cannedResponseId,
        formData: form.pages.flatMap((page) => page.fields.flatMap((field) => formFieldAnswers(field, values[field.id]))),
    });
};