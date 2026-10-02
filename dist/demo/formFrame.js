import { isRecord, readArray, readString } from '#shared';
/**
 * Builds the frame for a form answer.
 *
 * @param postback - The `postback` option: `{ id, text, cannedResponseId, formData: [{ id, text,
 *   payload }] }`.
 * @param tracingId - Stamped on the frame.
 * @returns `{ type: 'Structured', text: text || '', content: [{ contentType: 'Form', form: {
 *   originatingMessageId: id, cannedResponseId: cannedResponseId || '', response: [{ id, component: {
 *   contentType: 'ButtonResponse', buttonResponse: { type: 'Form', text, payload } } }] } }],
 *   metadata, tracingId }` — no `parentMessageId` (forms link through the form item).
 * @remarks Pure. Part of `sendingFrame`; tested through it.
 */
export const formFrame = (postback, tracingId) => {
    const response = readArray(postback, 'formData')
        .filter(isRecord)
        .map((field) => ({
        id: field['id'],
        component: {
            contentType: 'ButtonResponse',
            buttonResponse: { type: 'Form', text: field['text'], payload: field['payload'] },
        },
    }));
    return {
        type: 'Structured',
        text: readString(postback, 'text') ?? '',
        content: [
            {
                contentType: 'Form',
                form: {
                    originatingMessageId: readString(postback, 'id'),
                    cannedResponseId: readString(postback, 'cannedResponseId') ?? '',
                    response,
                },
            },
        ],
        metadata: {},
        tracingId,
    };
};