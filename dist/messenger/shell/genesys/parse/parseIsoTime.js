/**
 * Reads an ISO-8601 timestamp from an SDK payload (`channel.time`, `timestamp`).
 *
 * @param value - Untrusted; expected to be a string such as `2026-10-01T17:39:05.291Z`.
 * @returns Epoch milliseconds, or `undefined` when `value` is not a string or `Date.parse`
 *   can't read it (including the empty string the formatted shape uses for "unknown").
 * @remarks Pure.
 */
export const parseIsoTime = (value) => {
    if (typeof value !== 'string')
        return undefined;
    const ms = Date.parse(value);
    return Number.isNaN(ms) ? undefined : ms;
};