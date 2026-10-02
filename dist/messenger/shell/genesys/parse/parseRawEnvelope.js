import { err, ok, readRecord, readString } from '#shared';
import { invalidPayload } from "../../../types.js";
import { parseIsoTime } from "./parseIsoTime.js";
import { parseSender } from "./parseSender.js";
/**
 * Reads the identity of a raw Guest API message: who, when, which way.
 *
 * @param message - The raw body, already narrowed to a record.
 * @returns `id` (non-empty `channel.messageId`, else `id`), `direction`, `time` from `channel.time`
 *   and `sender` from `channel.from`.
 * @errors InvalidPayload (source `message`) - when `id` is missing or empty, `direction` is not
 *   `Inbound`/`Outbound`, or `channel.time` is unreadable.
 * @remarks Pure. Part of the message parsers; tested through them.
 */
export const parseRawEnvelope = (message) => {
    const id = readString(message, 'id');
    const direction = readString(message, 'direction');
    const channel = readRecord(message, 'channel') ?? {};
    const time = parseIsoTime(channel['time']);
    if (!id)
        return err(invalidPayload('message', 'id is missing or empty'));
    if (direction !== 'Inbound' && direction !== 'Outbound') {
        return err(invalidPayload('message', `unknown direction ${String(direction)}`));
    }
    if (time === undefined)
        return err(invalidPayload('message', 'channel.time is unreadable'));
    // channel.messageId is what history calls the same message (sdk-source-notes.md).
    const messageId = [readString(channel, 'messageId'), id].find(Boolean) ?? id;
    return ok({ id: messageId, direction, time, sender: parseSender(channel['from']) });
};