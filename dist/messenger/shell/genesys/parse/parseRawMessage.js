import { err, isRecord, ok, readArray, readString } from '#shared';
import { invalidPayload } from "../../../types.js";
import { messageExtras } from "./messageExtras.js";
import { parseRawContent } from "./parseRawContent.js";
import { parseRawEnvelope } from "./parseRawEnvelope.js";
import { parseRawReply } from "./parseRawReply.js";
import { readRawPresence } from "./readRawPresence.js";
import { toPresenceMessage } from "./toPresenceMessage.js";
/**
 * Parses a raw Guest API message body, the shape `messagesReceived` publishes.
 *
 * @param value - Untrusted: `{ id, type?, direction, text?, content?, events?, channel: { time,
 *   messageId?, from? }, metadata?, originatingEntity?, tracingId?, state? }`. A missing `type`
 *   (an attachment-only message) reads as `Text`.
 * @returns The message, with:
 *   - `id` = `channel.messageId` when non-empty, else `id` (so it matches the same message from
 *     history; docs/guides/sdk-source-notes.md, "Observed in a live session");
 *   - `time` from `channel.time` (`parseIsoTime`);
 *   - `text`: `text` when non-empty, else `parseRawReply(value).fallbackText`;
 *   - `sender` from `channel.from` (`parseSender`);
 *   - `content` through `parseRawContent`, unrecognised items dropped;
 *   - `replyTo` from `parseRawReply` when present;
 *   - `originatingEntity` when `Human`/`Bot`, `tracingId` when a non-empty string, and
 *     `consumed: true` only when `state` is `"consumed"`;
 *   - for `type: "Event"`: `presence` from the first `events[]` item with
 *     `eventType: "Presence"`, and empty `text` and `content`.
 * @errors InvalidPayload (source `message`) - when `value` is not a record; `id` is missing or
 *   empty; `direction` is not `Inbound`/`Outbound`; `channel.time` is unreadable; `type` is
 *   anything other than `Text`, `Structured` or `Event` (for example `Receipt`); or an `Event`
 *   carries no presence event with a known type (typing, co-browse, video).
 * @remarks Pure.
 */
export const parseRawMessage = (value) => {
    const types = ['Text', 'Structured', 'Event'];
    if (!isRecord(value))
        return err(invalidPayload('message', 'not a record'));
    const envelope = parseRawEnvelope(value);
    if (!envelope.ok)
        return envelope;
    const type = readString(value, 'type') ?? 'Text';
    if (!types.includes(type))
        return err(invalidPayload('message', `unsupported type ${type}`));
    const reply = parseRawReply(value);
    const base = { ...envelope.value, ...messageExtras(value, reply, envelope.value.direction) };
    if (type === 'Event')
        return toPresenceMessage(base, readRawPresence(value));
    return ok({
        ...base,
        // An empty own text falls through to the reply's, so `??` would not do.
        text: [readString(value, 'text'), reply.fallbackText].find(Boolean) ?? '',
        content: readArray(value, 'content')
            .map((item) => parseRawContent(item))
            .filter((content) => content !== undefined),
    });
};