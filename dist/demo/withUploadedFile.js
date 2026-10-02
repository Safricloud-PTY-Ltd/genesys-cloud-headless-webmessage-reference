import { isRecord, readArray, readRecord, readString } from '#shared';
/**
 * Fills in a sent frame's attachment the way the Guest API does before echoing it: the SDK sends
 * only the attachment id, and the echo comes back with the file's details (sdk-source-notes.md,
 * "An attachment-only message").
 *
 * @param frame - From `sendingFrame`.
 * @param file - The file that was staged when the frame was built; `undefined` when none.
 * @returns `frame` unchanged when `file` is `undefined` or `frame.content` holds no
 *   `contentType: 'Attachment'` item. Otherwise a copy whose `Attachment` items whose
 *   `attachment.id` equals `file.attachmentId` carry `attachment: { id, filename, fileSize, mime,
 *   url, mediaType }`, with `mediaType` `'Image'` when `mime` starts with `image/` and `'File'`
 *   otherwise. Other content items and the frame's other fields are kept as they are, in order.
 * @remarks Pure. Does not modify `frame`. Part of `startDemoBot`; tested through it.
 */
export const withUploadedFile = (frame, file) => {
    const content = readArray(frame, 'content');
    const hasAttachment = content.some((item) => isRecord(item) && readString(item, 'contentType') === 'Attachment');
    if (file === undefined || !hasAttachment) {
        return frame;
    }
    const attachment = {
        id: file.attachmentId,
        filename: file.filename,
        fileSize: file.fileSize,
        mime: file.mime,
        url: file.url,
        mediaType: file.mime.startsWith('image/') ? 'Image' : 'File',
    };
    return {
        ...frame,
        content: content.map((item) => isRecord(item) &&
            readString(item, 'contentType') === 'Attachment' &&
            readString(readRecord(item, 'attachment') ?? {}, 'id') === file.attachmentId
            ? { ...item, attachment }
            : item),
    };
};