import { err, isRecord, ok, readString } from '#shared';
import { invalidPayload } from "../../../types.js";
import { describeReason } from "../describeReason.js";
import { parseAllowedFileTypes } from "./parseAllowedFileTypes.js";
import { parseUploadingEvent } from "./parseUploadingEvent.js";
/**
 * Parses an upload event.
 *
 * @param name - Which event.
 * @param data - The envelope's `data`, untrusted.
 * @returns `uploading` with `percentage` clamped to [0, 100]; `fileUploaded` with
 *   `attachmentId` and `downloadUrl`; `fileUploadError` with `message` =
 *   `describeReason(data)`; `fileDeleted` with `attachmentId`; `allowedFileTypes` via
 *   `parseAllowedFileTypes`.
 * @errors InvalidPayload (source `name`) - when `data` is not a record (except for
 *   `fileUploadError`, which never fails), `percentage` is not a number, or a required id or URL
 *   is missing; and whatever `parseAllowedFileTypes` rejects.
 * @remarks Pure.
 */
export const parseFileEvent = (name, data) => {
    if (name === 'fileUploadError') {
        return ok({ kind: 'fileUploadError', message: describeReason(data) });
    }
    if (name === 'allowedFileTypes') {
        return parseAllowedFileTypes(data);
    }
    if (name === 'uploading') {
        return parseUploadingEvent(data);
    }
    const record = isRecord(data) ? data : {};
    const attachmentId = readString(record, 'attachmentId');
    if (attachmentId === undefined) {
        return err(invalidPayload(name, 'attachmentId is missing or not a string'));
    }
    if (name === 'fileDeleted') {
        return ok({ kind: 'fileDeleted', attachmentId });
    }
    const downloadUrl = readString(record, 'downloadUrl');
    if (downloadUrl === undefined) {
        return err(invalidPayload(name, 'downloadUrl is missing or not a string'));
    }
    return ok({ kind: 'fileUploaded', attachmentId, downloadUrl });
};