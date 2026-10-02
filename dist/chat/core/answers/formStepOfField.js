/**
 * Finds the step to show for fields that need an answer: the first page holding any of them.
 *
 * @param form - The form.
 * @param fieldIds - Field ids, any order. May be empty.
 * @returns The step position (counting the introduction when present) of the first page, in page
 *   order, that holds one of the ids; `undefined` when no page does.
 * @remarks Pure.
 */
export const formStepOfField = (form, fieldIds) => {
    const pageIndex = form.pages.findIndex((page) => page.fields.some((field) => fieldIds.includes(field.id)));
    return pageIndex === -1 ? undefined : pageIndex + (form.introduction === undefined ? 0 : 1);
};