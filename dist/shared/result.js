/**
 * Wraps a value as a successful `Result`.
 *
 * @param value - The success value.
 * @returns A `Result` whose `ok` is `true`.
 */
export const ok = (value) => ({ ok: true, value });
/**
 * Wraps an error as a failed `Result`.
 *
 * @param error - The error value, a plain object with a `kind` discriminant.
 * @returns A `Result` whose `ok` is `false`.
 */
export const err = (error) => ({ ok: false, error });