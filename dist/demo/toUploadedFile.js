import { isRecord, readArray, readNumber, readRecord, readString } from '#shared';
/**
 * Reads what the demo "server" keeps about the file a `requestUpload` call sent.
 *
 * @param options - The `requestUpload` options, untrusted: `{ file }`, a `FileList` or array whose
 *   element 0 is the file.
 * @param attachmentId - The id the upload is given.
 * @returns `{ attachmentId, filename, mime, fileSize, url }`: `filename` from the file's `name`
 *   (`file` when unreadable or empty), `mime` from `type` (`application/octet-stream` when
 *   unreadable or empty), `fileSize` from `size` (0 when unreadable), and
 *   `url` `https://demo.invalid/<attachmentId>/<encodeURIComponent(filename)>`.
 * @remarks Pure. Part of `startDemoBot`; tested through it.
 */
export const toUploadedFile = (options, attachmentId) => {
    const record = isRecord(options) ? options : {};
    // A FileList is array-like, not an Array: element 0 is what `item(0)` returns.
    const file = readArray(record, 'file')[0] ?? readRecord(record, 'file')?.['0'];
    // A File is a class instance; its name, type and size are readable through the prototype.
    const fields = isRecord(file) ? file : {};
    const filename = [readString(fields, 'name')].find(Boolean) ?? 'file';
    return {
        attachmentId,
        filename,
        // Browsers report an unknown type as ''.
        mime: [readString(fields, 'type')].find(Boolean) ?? 'application/octet-stream',
        fileSize: readNumber(fields, 'size') ?? 0,
        url: `https://demo.invalid/${attachmentId}/${encodeURIComponent(filename)}`,
    };
};