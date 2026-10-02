/**
 * Builds the `MessagingService.sendMessage` options for an answer to structured content, in the
 * shape the Genesys docs give (docs/guides/structured-messages.md).
 *
 * @param postback - The answer.
 * @returns
 *   - `quickReply`: `{ type: 'quickReply', postback: { action: 'Message', text, payload } }`;
 *   - `card`: `{ type: 'card', postback: { text, payload } }`;
 *   - `datePicker`: `{ type: 'datePicker', postback: { id: messageId, text, payload: { dateTime,
 *     duration: String(durationSeconds) } } }` (the SDK drops `duration` but the docs require it;
 *     `text` is honoured though undocumented);
 *   - `listPicker`: `{ type: 'listPicker', postback: { id: messageId, text, selectedOptions } }`;
 *   - `form`: `{ type: 'form', postback: { id: messageId, text, cannedResponseId, formData } }`.
 * @remarks Pure. Arrays are copied, never shared with the input.
 */
export const toPostbackOptions = (postback) => {
    switch (postback.kind) {
        case 'quickReply':
            return {
                type: 'quickReply',
                postback: { action: 'Message', text: postback.text, payload: postback.payload },
            };
        case 'card':
            return { type: 'card', postback: { text: postback.text, payload: postback.payload } };
        case 'datePicker':
            return {
                type: 'datePicker',
                postback: {
                    id: postback.messageId,
                    text: postback.text,
                    payload: { dateTime: postback.dateTime, duration: String(postback.durationSeconds) },
                },
            };
        case 'listPicker':
            return {
                type: 'listPicker',
                postback: {
                    id: postback.messageId,
                    text: postback.text,
                    selectedOptions: [...postback.selectedOptions],
                },
            };
        case 'form':
            return {
                type: 'form',
                postback: {
                    id: postback.messageId,
                    text: postback.text,
                    cannedResponseId: postback.cannedResponseId,
                    formData: [...postback.formData],
                },
            };
    }
};