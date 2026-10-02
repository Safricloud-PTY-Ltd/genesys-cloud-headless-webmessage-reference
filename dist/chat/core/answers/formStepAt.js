import { formStepCount } from "./formStepCount.js";
/**
 * Tells which step is at a position in the form's walk: introduction (when present), then each
 * page, then the summary (when `showSummary`).
 *
 * @param form - The form.
 * @param index - The step position, from 0. Clamped to [0, formStepCount(form) - 1].
 * @returns The step; a page step carries the page and its index in `form.pages`.
 * @remarks Pure. A form with no pages, no introduction and no summary has no steps; then the
 *   result is a `summary` step.
 */
export const formStepAt = (form, index) => {
    const position = Math.min(Math.max(index, 0), formStepCount(form) - 1);
    if (form.introduction !== undefined && position === 0) {
        return { kind: 'introduction', introduction: form.introduction };
    }
    const pageIndex = position - (form.introduction === undefined ? 0 : 1);
    const page = form.pages[pageIndex];
    return page === undefined ? { kind: 'summary' } : { kind: 'page', page, pageIndex };
};