import { isRecord, readString } from '#shared';
/**
 * Makes the demo's `deleteFile` handler.
 *
 * @param fake - The queue to publish on.
 * @param staged - The staged-file cell shared with `demoUpload` and `demoSend`.
 * @returns A handler: reads `options.id`; when it equals the staged file's `attachmentId`, clears
 *   `staged`; publishes `fileDeleted` (`{ attachmentId: id }`) and resolves either way, as the SDK
 *   does for an id it queued.
 * @remarks Part of `startDemoBot`; tested through it.
 */
export const demoDelete = (fake, staged) => {
    return (options) => {
        const id = isRecord(options) ? readString(options, 'id') : undefined;
        if (id !== undefined && id === staged.get('file')?.attachmentId) {
            // eslint-disable-next-line functional/immutable-data -- the staged file is the one cell the demo handlers share
            staged.clear();
        }
        fake.publish('MessagingService.fileDeleted', { attachmentId: id });
        return { kind: 'resolve' };
    };
};