import { isRecord } from '#shared';
/**
 * Reads the payload of an event as the `Genesys` queue delivers it.
 *
 * @param envelope - The subscribe callback's argument, untrusted: `{ event, data, ... }`.
 * @returns Its `data`; `{}` when the envelope is not a record or `data` is `undefined` or `null`
 *   (CXBus publishes `{}` for events without a payload).
 * @remarks Pure. Part of `parseEvent`; tested through it.
 */
export const readEnvelopeData = (envelope) => {
    return isRecord(envelope) ? (envelope['data'] ?? {}) : {};
};