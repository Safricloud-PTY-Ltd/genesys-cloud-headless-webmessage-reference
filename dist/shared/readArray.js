/**
 * Reads one field of an untrusted record as an array of still-unchecked items.
 *
 * @param record - A record already narrowed with `isRecord`.
 * @param key - The field name. A missing key reads as an empty array.
 * @returns The field's items when it is an array, in order and unchanged; otherwise an empty
 *   array, so callers can `map` without a separate absence check.
 * @remarks Pure. The items are not inspected; each is parsed by the caller.
 */
export const readArray = (record, key) => {
    const value = record[key];
    return Array.isArray(value) ? value : [];
};