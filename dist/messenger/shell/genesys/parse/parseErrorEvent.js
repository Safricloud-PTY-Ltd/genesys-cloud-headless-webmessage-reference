import { isRecord, readNumber, readRecord, readString } from '#shared';
import { describeReason } from "../describeReason.js";
/**
 * Parses `MessagingService.error`, whose Guest API error frame sits under `data.error`
 * (docs/guides/sdk-source-notes.md).
 *
 * @param data - Untrusted: `{ error: { code?, errorKey?, body: { errorMessage, errorCode? } |
 *   string } }`, or anything else.
 * @returns An `error` event whose `message` is `describeReason(data.error ?? data)`, with
 *   `errorKey` when `data.error.errorKey` is a string, and `code` from `data.error.code` (or,
 *   failing that, `data.error.body.errorCode`) when it is a number, and `tracingId` when
 *   `data.error.tracingId` is a non-empty string.
 * @remarks Pure. Never fails: an error is worth showing even when its shape is unexpected.
 */
export const parseErrorEvent = (data) => {
    const error = isRecord(data) ? data['error'] : undefined;
    const frame = isRecord(error) ? error : {};
    const errorKey = readString(frame, 'errorKey');
    const tracingId = readString(frame, 'tracingId');
    const code = readNumber(frame, 'code') ?? readNumber({ ...readRecord(frame, 'body') }, 'errorCode');
    return {
        kind: 'error',
        message: describeReason(error ?? data),
        ...(errorKey === undefined ? {} : { errorKey }),
        ...(code === undefined ? {} : { code }),
        ...(tracingId ? { tracingId } : {}),
    };
};