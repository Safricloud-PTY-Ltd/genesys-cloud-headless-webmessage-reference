/**
 * Counts the steps `<chat-form>` walks through.
 *
 * @param form - The form.
 * @returns 1 for the introduction when there is one, plus one per page, plus 1 for the summary
 *   when `showSummary`.
 * @remarks Pure.
 */
export const formStepCount = (form) => {
    return (form.introduction === undefined ? 0 : 1) + form.pages.length + (form.showSummary ? 1 : 0);
};