/**
 * Reads one field of an untrusted record as string, treating any other type as absent.
 *
 * @param record - A record already narrowed with `isRecord`.
 * @param key - The field name. A missing key reads as absent.
 * @returns The field's value when it is a string (the empty string included); otherwise `undefined`.
 * @remarks Pure. Never coerces: `"1"` is not a number and `0` is not a boolean.
 */
export const readString = (record, key) => {
    const value = record[key];
    return typeof value === 'string' ? value : undefined;
};