import { err, ok } from '#shared';
/**
 * Builds the answer to a list picker from the ids the customer chose.
 *
 * @param messageId - The outbound message carrying the picker.
 * @param picker - The picker; its `replyText` becomes the answer's `text`.
 * @param selectedIds - Chosen item ids, in the order chosen. Ids not in the picker are ignored;
 *   a repeated id counts once.
 * @returns A `listPicker` postback with one `{ text: item.title, payload: item.id }` per chosen
 *   item, in `selectedIds` order.
 * @errors NothingSelected - when no id in `selectedIds` names an item of the picker. Genesys
 *   requires at least one option and the SDK doesn't check (structured-messages.md).
 * @remarks Pure. The single-choice rule of a section is the UI's to enforce; this does not check it.
 */
export const listPickerAnswer = (messageId, picker, selectedIds) => {
    const itemsById = new Map(picker.sections.flatMap((section) => section.items).map((item) => [item.id, item]));
    const selectedOptions = [...new Set(selectedIds)].flatMap((id) => {
        const item = itemsById.get(id);
        return item === undefined ? [] : [{ text: item.title, payload: item.id }];
    });
    if (selectedOptions.length === 0) {
        return err({ kind: 'NothingSelected' });
    }
    return ok({ kind: 'listPicker', messageId, text: picker.replyText, selectedOptions });
};