import { err, isRecord, ok, readArray, readRecord, readString } from '#shared';
import { invalidPayload } from "../../../types.js";
import { readSendingReply } from "./readSendingReply.js";
/**
 * Parses `MessagingService.sendingMessage`, published when the SDK writes an outgoing frame.
 *
 * @param data - Untrusted: `{ message: { type?, text?, content?, tracingId } }`.
 * @returns A `sendingMessage` event with `tracingId`, `text` (the frame's `text`, else
 *   `parseRawReply(message).fallbackText`, as for received messages: a date-picker answer's frame
 *   has no top-level `text`, only its button's) and the
 *   `attachmentIds` of `content[]` items with `contentType: "Attachment"`, and `replyTo` when
 *   `parseRawReply(message)` finds one (a date-picker, list-picker or form answer). `undefined`
 *   (nothing to show, not malformed) when `type` is `Event` (the autoStart Join presence, co-browse
 *   and video frames) or the frame has neither text nor an attachment.
 * @errors InvalidPayload (source `sendingMessage`) - when `message` or `tracingId` is missing.
 * @remarks Pure. A missing `type` is an attachment-only message and is accepted.
 */
export const parseSendingMessage = (data) => {
    const message = isRecord(data) ? readRecord(data, 'message') : undefined;
    if (message === undefined) {
        return err(invalidPayload('sendingMessage', 'message is missing'));
    }
    const tracingId = readString(message, 'tracingId');
    if (tracingId === undefined) {
        return err(invalidPayload('sendingMessage', 'tracingId is missing'));
    }
    if (readString(message, 'type') === 'Event') {
        return ok(undefined);
    }
    const { text, ...reply } = readSendingReply(message);
    const attachmentIds = readArray(message, 'content')
        .filter(isRecord)
        .filter((item) => readString(item, 'contentType') === 'Attachment')
        .map((item) => readRecord(item, 'attachment'))
        .filter(isRecord)
        .map((attachment) => readString(attachment, 'id'))
        .filter((id) => id !== undefined);
    if (text === '' && attachmentIds.length === 0) {
        return ok(undefined);
    }
    return ok({ kind: 'sendingMessage', tracingId, text, attachmentIds, ...reply });
};