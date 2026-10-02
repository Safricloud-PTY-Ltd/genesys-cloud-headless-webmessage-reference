import { isRecord, readArray, readString } from '#shared';
/**
 * Builds the frame for a list picker answer.
 *
 * @param postback - The `postback` option: `{ id, text, selectedOptions: [{ text, payload }] }`.
 * @param tracingId - Stamped on the frame.
 * @returns `{ type: 'Structured', text, content: [one ButtonResponse { type: 'ListPicker', text,
 *   payload, originatingMessageId: id } per option, in order], metadata: { parentMessageId: id }
 *   (only when `id` is set), tracingId }`.
 * @remarks Pure. Part of `sendingFrame`; tested through it.
 */
export const listPickerFrame = (postback, tracingId) => {
    const id = readString(postback, 'id');
    const text = readString(postback, 'text');
    const content = readArray(postback, 'selectedOptions')
        .filter(isRecord)
        .map((option) => ({
        contentType: 'ButtonResponse',
        buttonResponse: {
            type: 'ListPicker',
            text: option['text'],
            payload: option['payload'],
            originatingMessageId: id,
        },
    }));
    return {
        type: 'Structured',
        ...(text === undefined ? {} : { text }),
        content,
        metadata: id === undefined ? {} : { parentMessageId: id },
        tracingId,
    };
};