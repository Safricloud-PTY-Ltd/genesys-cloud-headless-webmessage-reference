import { readRecord, readString } from '#shared';
import { buttonResponseFrame } from "./buttonResponseFrame.js";
import { datePickerFrame } from "./datePickerFrame.js";
import { formFrame } from "./formFrame.js";
import { listPickerFrame } from "./listPickerFrame.js";
import { textFrame } from "./textFrame.js";
/**
 * Builds the frame the real SDK would write for a `sendMessage` call, as `sendingMessage`
 * publishes it (structured-messages.md, "What the transport builds").
 *
 * @param options - The `sendMessage` options: `{ message }` or `{ type, postback }`.
 * @param tracingId - The id to stamp on the frame.
 * @param stagedAttachmentId - An uploaded file waiting to go with this message, if any.
 * @returns `{ type, text?, content?, metadata, tracingId }`: `Text` with `text` (plus an
 *   `Attachment` content item when a file is staged; no `type` and no `text` for a file alone);
 *   `Structured` with a `ButtonResponse` of type `QuickReply` (quickReply) or `Button` (card),
 *   `DatePicker` (datePicker, payload = dateTime, `metadata.parentMessageId` = postback.id),
 *   one `ListPicker` button response per selected option (listPicker, with
 *   `metadata.parentMessageId`), or a `Form` item with `originatingMessageId` and `response`
 *   (form). `undefined` when there is nothing to send (no text, no file, no known postback).
 * @remarks Pure.
 */
export const sendingFrame = (options, tracingId, stagedAttachmentId) => {
    const type = readString(options, 'type');
    const postback = readRecord(options, 'postback');
    if (type === undefined) {
        return textFrame(readString(options, 'message'), tracingId, stagedAttachmentId);
    }
    if (postback === undefined) {
        return undefined;
    }
    switch (type) {
        case 'quickReply':
            return buttonResponseFrame(postback, 'QuickReply', tracingId);
        case 'card':
            return buttonResponseFrame(postback, 'Button', tracingId);
        case 'datePicker':
            return datePickerFrame(postback, tracingId);
        case 'listPicker':
            return listPickerFrame(postback, tracingId);
        case 'form':
            return formFrame(postback, tracingId);
        default:
            return undefined;
    }
};