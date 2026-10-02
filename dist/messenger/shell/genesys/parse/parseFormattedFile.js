import { isRecord, omitUndefined, readNumber, readString } from '#shared';
import { parseIsoTime } from "./parseIsoTime.js";
import { toMediaType } from "./toMediaType.js";
/**
 * Reads one attachment in the SDK's formatted shape (`files[]` in `restored`/`oldMessages`).
 *
 * @param value - Untrusted: `{ id, type (the media type), downloadUrl, mime, name, size,
 *   updatedTime? }`.
 * @returns The attachment with `type` → `mediaType`, `downloadUrl` → `url`, `name` →
 *   `filename`, `size` → `fileSize`, and `updatedTime` → `refreshedAt` when it parses as an ISO
 *   time (the SDK sets it only on the file a `getFile` refreshed; sdk-source-notes.md, "getFile
 *   and refreshFiles"); `undefined` when `id` is missing. An unknown media type
 *   reads as `File`.
 * @remarks Pure.
 */
export const parseFormattedFile = (value) => {
    if (!isRecord(value))
        return undefined;
    const id = readString(value, 'id');
    if (id === undefined)
        return undefined;
    const mediaType = toMediaType(value['type']);
    const url = readString(value, 'downloadUrl');
    const mime = readString(value, 'mime');
    const filename = readString(value, 'name');
    const fileSize = readNumber(value, 'size');
    const refreshedAt = parseIsoTime(value['updatedTime']);
    return { id, mediaType, ...omitUndefined({ url, mime, filename, fileSize, refreshedAt }) };
};