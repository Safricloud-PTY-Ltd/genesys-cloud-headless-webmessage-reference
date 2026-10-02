import { toUploadedFile } from "./toUploadedFile.js";
/**
 * Makes the demo's `requestUpload` handler.
 *
 * @param fake - The queue to publish on.
 * @param deps - Ids and the clock.
 * @param staged - The staged-file cell shared with `demoSend`.
 * @returns A handler: reads the first file of `options.file` (a `FileList` or array; element 0),
 *   taking its `name` (`file` when unreadable), `type` (`application/octet-stream` when unreadable
 *   or empty) and `size` (0 when unreadable). With a new id from `deps.randomId()`, publishes
 *   `uploading` 50, `uploading` 100, then `fileUploaded` (`{ attachmentId, downloadUrl:
 *   'https://demo.invalid/<id>/<encoded name>', timestamp }`, timestamp the ISO string of
 *   `deps.now()`), stores `{ attachmentId, filename, mime, fileSize, url: downloadUrl }` under
 *   `file` in `staged`, and resolves.
 * @remarks Part of `startDemoBot`; tested through it.
 */
export const demoUpload = (fake, deps, staged) => {
    return (options) => {
        const file = toUploadedFile(options, deps.randomId());
        fake.publish('MessagingService.uploading', { percentage: 50 });
        fake.publish('MessagingService.uploading', { percentage: 100 });
        fake.publish('MessagingService.fileUploaded', {
            attachmentId: file.attachmentId,
            downloadUrl: file.url,
            timestamp: new Date(deps.now()).toISOString(),
        });
        // eslint-disable-next-line functional/immutable-data -- the staged file is the one cell the demo handlers share
        staged.set('file', file);
        return { kind: 'resolve' };
    };
};