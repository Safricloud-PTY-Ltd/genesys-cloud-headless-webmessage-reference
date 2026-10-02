import { readString } from '#shared';
/**
 * Builds the frame for a quick-reply or card-button answer.
 *
 * @param postback - The `postback` option: `{ text, payload }`.
 * @param buttonType - `QuickReply` for a quick reply, `Button` for a card button.
 * @param tracingId - Stamped on the frame.
 * @returns `{ type: 'Structured', text, content: [{ contentType: 'ButtonResponse', buttonResponse:
 *   { type: buttonType, text, payload } }], metadata, tracingId }`.
 * @remarks Pure. Part of `sendingFrame`; tested through it.
 */
export const buttonResponseFrame = (postback, buttonType, tracingId) => {
    const text = readString(postback, 'text');
    return {
        type: 'Structured',
        ...(text === undefined ? {} : { text }),
        content: [
            {
                contentType: 'ButtonResponse',
                buttonResponse: { type: buttonType, text, payload: postback['payload'] },
            },
        ],
        metadata: {},
        tracingId,
    };
};