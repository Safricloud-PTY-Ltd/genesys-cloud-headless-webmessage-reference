import { isRecord, readNumber, readString } from '#shared';
import { toMediaType } from "./toMediaType.js";
/**
 * Reads a raw Guest API attachment (`content[].attachment` in `messagesReceived`).
 *
 * @param value - Untrusted: `{ id, mediaType, url?, mime?, filename? | fileName?, fileSize? }`.
 * @returns The attachment, or `undefined` when `id` is missing. An unknown or missing
 *   `mediaType` reads as `File`. Optional fields are copied only when they have the right type.
 * @remarks Pure.
 */
export const parseAttachment = (value) => {
    if (!isRecord(value))
        return undefined;
    const id = readString(value, 'id');
    if (id === undefined)
        return undefined;
    const mediaType = toMediaType(value['mediaType']);
    const url = readString(value, 'url');
    const mime = readString(value, 'mime');
    const filename = [readString(value, 'filename'), readString(value, 'fileName')].find((name) => name !== undefined);
    const fileSize = readNumber(value, 'fileSize');
    return {
        id,
        mediaType,
        ...(url === undefined ? {} : { url }),
        ...(mime === undefined ? {} : { mime }),
        ...(filename === undefined ? {} : { filename }),
        ...(fileSize === undefined ? {} : { fileSize }),
    };
};