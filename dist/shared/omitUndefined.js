/**
 * Drops the fields whose value is `undefined`, so optional fields can be spread into an object
 * without one conditional per field (`exactOptionalPropertyTypes` rejects `field: undefined`).
 *
 * @param fields - A flat record. May be empty.
 * @returns A new object with every own key of `fields` whose value is not `undefined`, with its
 *   value unchanged; `null`, `0`, `''` and `false` are kept.
 * @remarks Pure. Does not modify `fields`. Shallow: nested `undefined`s are left as they are.
 */
export const omitUndefined = (fields) => {
    // fromEntries types its result as a plain record; the filter is exactly the narrowing the return type states.
    return Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined));
};