/**
 * Tells whether an untrusted value is a non-null, non-array object whose fields can be read.
 *
 * @param value - Anything: an SDK payload, parsed JSON, a field of either.
 * @returns `true` for objects (including class instances and `Object.create(null)`), `false`
 *   for `null`, `undefined`, arrays, functions and every primitive.
 * @remarks Pure. The entry point of every hand-written parser: narrow with this, then read
 *   fields with `readString`, `readNumber`, `readBoolean`, `readArray`, `readRecord`.
 */
export const isRecord = (value) => {
    return typeof value === 'object' && Boolean(value) && !Array.isArray(value);
};