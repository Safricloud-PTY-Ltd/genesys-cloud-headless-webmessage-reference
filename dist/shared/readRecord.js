import { isRecord } from "./isRecord.js";
/**
 * Reads one field of an untrusted record as a nested record.
 *
 * @param record - A record already narrowed with `isRecord`.
 * @param key - The field name. A missing key reads as absent.
 * @returns The field's value when `isRecord` accepts it; otherwise `undefined`.
 * @remarks Pure.
 */
export const readRecord = (record, key) => {
    const value = record[key];
    return isRecord(value) ? value : undefined;
};