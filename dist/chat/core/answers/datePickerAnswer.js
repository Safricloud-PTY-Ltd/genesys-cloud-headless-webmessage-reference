/**
 * Builds the answer to a date picker.
 *
 * @param messageId - The outbound message carrying the picker; becomes `postback.id` so the
 *   reply can be linked to it.
 * @param slot - The chosen slot, exactly as the picker offered it.
 * @param label - How the choice reads to the agent, for example "Thu 2 Oct, 14:30"; the UI
 *   formats it in the customer's locale.
 * @returns A `datePicker` postback carrying the slot's `dateTime` and `durationSeconds`
 *   unchanged and `text` = `label`.
 * @remarks Pure.
 */
export const datePickerAnswer = (messageId, slot, label) => {
    return {
        kind: 'datePicker',
        messageId,
        dateTime: slot.dateTime,
        durationSeconds: slot.durationSeconds,
        text: label,
    };
};