/**
 * Normalises an SDK expiry timestamp to epoch milliseconds. The SDK documents milliseconds but
 * sends seconds (`expirationDate: 1791139139`, observed live; docs/guides/sdk-source-notes.md).
 *
 * @param value - A Unix timestamp in seconds or milliseconds. Values below 100 000 000 000
 *   (year 5138 in seconds, 1973 in milliseconds) are taken as seconds.
 * @returns The same instant in milliseconds.
 * @remarks Pure.
 */
export const toEpochMs = (value) => value < 100_000_000_000 ? value * 1000 : value;