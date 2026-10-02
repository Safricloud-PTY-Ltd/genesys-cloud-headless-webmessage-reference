import { err, isRecord, ok, readNumber } from '#shared';
import { invalidPayload } from "../../../types.js";
/**
 * Parses `MessagingService.uploading`.
 *
 * @param data - Untrusted: `{ percentage }`.
 * @returns An `uploading` event with `percentage` clamped to [0, 100].
 * @errors InvalidPayload (source `uploading`) - when `data` is not a record or `percentage` is not
 *   a finite number.
 * @remarks Pure. Part of `parseFileEvent`; tested through it.
 */
export const parseUploadingEvent = (data) => {
    const percentage = isRecord(data) ? readNumber(data, 'percentage') : undefined;
    if (percentage === undefined) {
        return err(invalidPayload('uploading', 'percentage is not a finite number'));
    }
    return ok({ kind: 'uploading', percentage: Math.min(100, Math.max(0, percentage)) });
};