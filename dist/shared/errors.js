/**
 * Wraps anything thrown or rejected into an `Unexpected` error value.
 *
 * @param cause - Whatever was thrown or rejected.
 * @returns An `Unexpected` carrying the cause.
 */
export const toUnexpected = (cause) => ({ kind: 'Unexpected', cause });