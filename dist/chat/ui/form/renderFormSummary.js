import { summaryAnswer } from "../../core/index.js";
import { strings } from "../strings.js";
/**
 * Lists every field of a form with the answer given, for the summary page.
 *
 * @param form - The form.
 * @param values - The answers so far.
 * @param document - The document to create elements with.
 * @returns A `<dl class="form-summary">` with one `<dt>` (field title, or the page title when the
 *   field has none) and `<dd>` per field in page order. The `<dd>` shows: an input's text, trimmed; a date
 *   via `formatFormDate` in the field's display format; chosen list items' titles joined with
 *   `", "`; the chosen wheel item's title; or `strings.formEmptyAnswer` when unanswered.
 * @remarks Sets no `innerHTML`.
 */
export const renderFormSummary = (form, values, document) => {
    const list = document.createElement('dl');
    list.className = 'form-summary';
    list.append(...form.pages.flatMap((page) => page.fields.flatMap((field) => {
        const term = document.createElement('dt');
        term.textContent = field.title || page.title;
        const answer = document.createElement('dd');
        answer.textContent = summaryAnswer(field, values[field.id]) ?? strings.formEmptyAnswer;
        return [term, answer];
    })));
    return list;
};