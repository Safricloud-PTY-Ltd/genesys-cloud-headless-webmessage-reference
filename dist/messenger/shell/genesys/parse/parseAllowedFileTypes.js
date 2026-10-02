import { err, isRecord, ok, readArray, readNumber, readRecord, readString, } from '#shared';
import { invalidPayload } from "../../../types.js";
/**
 * Parses `MessagingService.allowedFileTypes`, which carries the whole session response.
 *
 * @param data - Untrusted: `{ allowedMedia: { inbound: { fileTypes: [{ type }], maxFileSizeKB } },
 *   blockedExtensions?: string[] }`.
 * @returns An `allowedFileTypes` event with each `fileTypes[].type` string lower-cased (entries
 *   without a string `type` skipped), `maxFileSizeKB` (10 240, the Guest API's ceiling, when it is
 *   missing or not a positive number: the SDK treats it as optional; gotchas.md, "Attachments"), and `blockedExtensions` lower-cased with a
 *   leading dot added where missing (empty when absent).
 * @errors InvalidPayload (source `allowedFileTypes`) - when `allowedMedia.inbound` is missing.
 * @remarks Pure.
 */
export const parseAllowedFileTypes = (data) => {
    const body = isRecord(data) ? data : {};
    const allowedMedia = readRecord(body, 'allowedMedia') ?? {};
    const inbound = readRecord(allowedMedia, 'inbound');
    if (inbound === undefined) {
        return err(invalidPayload('allowedFileTypes', 'allowedMedia.inbound is missing'));
    }
    const reported = readNumber(inbound, 'maxFileSizeKB');
    const maxFileSizeKB = reported !== undefined && Number.isFinite(reported) && reported > 0 ? reported : 10240;
    return ok({
        kind: 'allowedFileTypes',
        fileTypes: readArray(inbound, 'fileTypes')
            .filter(isRecord)
            .map((entry) => readString(entry, 'type'))
            .filter((type) => type !== undefined)
            .map((type) => type.toLowerCase()),
        maxFileSizeKB,
        blockedExtensions: readArray(body, 'blockedExtensions')
            .filter((extension) => typeof extension === 'string')
            .map((extension) => (extension.startsWith('.') ? extension : `.${extension}`).toLowerCase()),
    });
};