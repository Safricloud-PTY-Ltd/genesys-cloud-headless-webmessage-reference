import { readRecord, readString } from '#shared';
/**
 * Builds the frame for a date picker answer, as the SDK's transport does (it drops `duration`).
 *
 * @param postback - The `postback` option: `{ id, text?, payload: { dateTime, duration } }`.
 * @param tracingId - Stamped on the frame.
 * @returns `{ type: 'Structured', content: [{ contentType: 'ButtonResponse', buttonResponse: { type:
 *   'DatePicker', text: postback.text, payload: dateTime } }], metadata: { parentMessageId: id },
 *   tracingId }` with no top-level `text`.
 * @remarks Pure. Part of `sendingFrame`; tested through it.
 */
export const datePickerFrame = (postback, tracingId) => {
    const id = readString(postback, 'id');
    const dateTime = readString(readRecord(postback, 'payload') ?? {}, 'dateTime');
    return {
        type: 'Structured',
        content: [
            {
                contentType: 'ButtonResponse',
                buttonResponse: {
                    type: 'DatePicker',
                    text: readString(postback, 'text'),
                    payload: dateTime,
                },
            },
        ],
        metadata: id === undefined ? {} : { parentMessageId: id },
        tracingId,
    };
};