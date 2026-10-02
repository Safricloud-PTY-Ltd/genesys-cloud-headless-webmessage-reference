import { err, isRecord, ok, omitUndefined, readBoolean, readRecord, readString, } from '#shared';
import { readDisconnectTime } from "./readDisconnectTime.js";
import { invalidPayload } from "../../../types.js";
/**
 * Parses a conversation lifecycle event (payloads per docs/guides/sdk-source-notes.md).
 *
 * @param name - Which event.
 * @param data - The envelope's `data`, untrusted.
 * @returns `started` with `newSession` and `readOnly` (each `true` only for boolean `true`);
 *   `conversationDisconnected` with `readOnly` likewise, and `time` from
 *   `parseIsoTime(data.message.channel.time)` when that parses (the SDK republishes this event for
 *   old Disconnects in fetched history; sdk-source-notes.md, "What is filtered, and what is not"); `conversationReset` with
 *   `newSession`; `readOnlyConversation` with no fields, except that a `SessionResponse` frame
 *   (`class` is `"SessionResponse"`) whose `body.readOnly` is not `true` gives `undefined`: nothing
 *   happened. The SDK publishes that frame on every restore, read-only or not (observed live).
 * @errors InvalidPayload (source `name`) - when `data` is not a record.
 * @remarks Pure.
 */
export const parseLifecycleEvent = (name, data) => {
    if (!isRecord(data))
        return err(invalidPayload(name, 'data is not a record'));
    if (name === 'started') {
        return ok({
            kind: 'started',
            newSession: readBoolean(data, 'newSession') === true,
            readOnly: readBoolean(data, 'readOnly') === true,
        });
    }
    if (name === 'conversationDisconnected') {
        return ok({
            kind: 'conversationDisconnected',
            readOnly: readBoolean(data, 'readOnly') === true,
            ...omitUndefined({ time: readDisconnectTime(data) }),
        });
    }
    if (name === 'conversationReset') {
        return ok({ kind: 'conversationReset', newSession: readBoolean(data, 'newSession') === true });
    }
    const body = readRecord(data, 'body') ?? {};
    if (readString(data, 'class') === 'SessionResponse' && readBoolean(body, 'readOnly') !== true) {
        return ok(undefined);
    }
    return ok({ kind: 'readOnlyConversation' });
};