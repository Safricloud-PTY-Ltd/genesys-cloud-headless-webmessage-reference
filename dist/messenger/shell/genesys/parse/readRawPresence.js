import { isRecord, readArray, readString } from '#shared';
import { parsePresenceType } from "./parsePresenceType.js";
/**
 * Finds the presence type of a raw `Event` message.
 *
 * @param message - The raw body, already narrowed to a record.
 * @returns `parsePresenceType` of the `presence` of the first `events[]` record with
 *   `eventType: "Presence"`; `undefined` when there is none.
 * @remarks Pure. Part of the message parsers; tested through them.
 */
export const readRawPresence = (message) => {
    const event = readArray(message, 'events')
        .filter(isRecord)
        .find((item) => readString(item, 'eventType') === 'Presence');
    return parsePresenceType(event?.['presence']);
};