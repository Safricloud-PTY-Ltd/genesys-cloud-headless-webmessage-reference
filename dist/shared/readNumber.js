/**
 * Reads one field of an untrusted record as number, treating any other type as absent.
 *
 * @param record - A record already narrowed with `isRecord`.
 * @param key - The field name. A missing key reads as absent.
 * @returns The field's value when it is a finite number (`NaN` and infinities read as absent); otherwise `undefined`.
 * @remarks Pure. Never coerces: `"1"` is not a number and `0` is not a boolean.
 */
export const readNumber = (record, key) => {
    const value = record[key];
    return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
};