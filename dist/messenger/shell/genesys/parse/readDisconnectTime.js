import { readRecord } from '#shared';
import { parseIsoTime } from "./parseIsoTime.js";
/**
 * Reads when a Disconnect happened, from a `conversationDisconnected` payload.
 *
 * @param data - The payload, already narrowed to a record: `{ message: <raw Disconnect presence
 *   body>, readOnly }`.
 * @returns Epoch ms from `parseIsoTime(data.message.channel.time)`; `undefined` when `message` or
 *   `channel` is missing or not a record, or the time doesn't parse.
 * @remarks Pure. Part of `parseLifecycleEvent`; tested through it.
 */
export const readDisconnectTime = (data) => {
    const channel = readRecord(readRecord(data, 'message') ?? {}, 'channel') ?? {};
    return parseIsoTime(channel['time']);
};