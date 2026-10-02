import { err, ok, readString } from '#shared';
import { invalidPayload } from "../../../types.js";
import { parseIsoTime } from "./parseIsoTime.js";
import { parseSender } from "./parseSender.js";
/**
 * Reads the identity of a message in the SDK's formatted shape.
 *
 * @param message - The formatted message, already narrowed to a record.
 * @returns `id`, `direction` from `messageType` (`inbound` → `Inbound`, `outbound` → `Outbound`),
 *   `time` from `timestamp` or else `time`, and `sender` from `from`.
 * @errors InvalidPayload (source `message`) - when `id` is missing or empty, `messageType` is
 *   neither direction, or neither time is readable.
 * @remarks Pure. Part of the message parsers; tested through them.
 */
export const parseFormattedEnvelope = (message) => {
    const directions = new Map([
        ['inbound', 'Inbound'],
        ['outbound', 'Outbound'],
    ]);
    const id = readString(message, 'id');
    const direction = directions.get(readString(message, 'messageType') ?? '');
    const time = parseIsoTime(message['timestamp']) ?? parseIsoTime(message['time']);
    if (!id)
        return err(invalidPayload('message', 'id is missing or empty'));
    if (direction === undefined)
        return err(invalidPayload('message', 'unknown messageType'));
    if (time === undefined)
        return err(invalidPayload('message', 'timestamp and time unreadable'));
    return ok({ id: id, direction, time, sender: parseSender(message['from']) });
};