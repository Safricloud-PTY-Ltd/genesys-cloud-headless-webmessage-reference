/**
 * Builds the frame for a typed message, with or without the staged file.
 *
 * @param message - The `message` option, untrimmed; `undefined` when absent.
 * @param tracingId - Stamped on the frame.
 * @param stagedAttachmentId - An uploaded file waiting to go, if any.
 * @returns For non-blank text: `{ type: 'Text', text: trimmed, content?: [attachment], metadata, tracingId }`.
 *   For blank text with a staged file: `{ content: [{ contentType: 'Attachment', attachment: { id } }],
 *   metadata, tracingId }` (no `type`, no `text`). Otherwise `undefined`.
 * @remarks Pure. Part of `sendingFrame`; tested through it.
 */
export const textFrame = (message, tracingId, stagedAttachmentId) => {
    const text = (message ?? '').trim();
    const attachments = stagedAttachmentId === undefined
        ? []
        : [{ contentType: 'Attachment', attachment: { id: stagedAttachmentId } }];
    if (text.length > 0) {
        return {
            type: 'Text',
            text,
            ...(attachments.length > 0 ? { content: attachments } : {}),
            metadata: {},
            tracingId,
        };
    }
    return attachments.length > 0 ? { content: attachments, metadata: {}, tracingId } : undefined;
};