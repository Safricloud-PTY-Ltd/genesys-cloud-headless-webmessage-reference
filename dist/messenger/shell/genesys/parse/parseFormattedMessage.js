import { err, isRecord, ok, readString } from '#shared';
import { invalidPayload } from "../../../types.js";
import { messageExtras } from "./messageExtras.js";
import { parseFormattedContent } from "./parseFormattedContent.js";
import { parseFormattedEnvelope } from "./parseFormattedEnvelope.js";
import { parseFormattedReply } from "./parseFormattedReply.js";
import { parsePresenceType } from "./parsePresenceType.js";
import { toPresenceMessage } from "./toPresenceMessage.js";
/**
 * Parses a message in the SDK's formatted shape, the one `restored`, `oldMessages` and
 * `messagesUpdated` publish (docs/guides/sdk-source-notes.md, "Message objects: two shapes").
 *
 * @param value - Untrusted: `{ id, messageType: 'inbound' | 'outbound', type: 'text' |
 *   'structured' | 'event', timestamp | time, text?, from, files, quickReplies, card, carousel,
 *   datePicker, listPicker?, form?, eventType?, presence?, originatingEntity, tracingId, state?,
 *   parentMessageId?, payload? }`.
 * @returns The message, with:
 *   - `direction` from `messageType` (`inbound` → `Inbound`, `outbound` → `Outbound`);
 *   - `time` from `timestamp`, or `time` when `timestamp` is unreadable (`parseIsoTime`);
 *   - `text`: `text` when non-empty, else `parseFormattedReply(value).fallbackText`;
 *   - `sender` from `from` (`parseSender`), content from `parseFormattedContent`;
 *   - `replyTo` from `parseFormattedReply` when present;
 *   - `originatingEntity` when `Human`/`Bot`, `tracingId` when non-empty, and `consumed: true`
 *     only when `state` is `"consumed"`;
 *   - for `type: "event"`: `presence` from `presence.type`, with empty `text` and `content`.
 * @errors InvalidPayload (source `message`) - when `value` is not a record; `id` is missing or
 *   empty; `messageType` is neither direction; neither time is readable; or `type` is `event`
 *   without a known presence type.
 * @remarks Pure.
 */
export const parseFormattedMessage = (value) => {
    if (!isRecord(value))
        return err(invalidPayload('message', 'not a record'));
    const envelope = parseFormattedEnvelope(value);
    if (!envelope.ok)
        return envelope;
    const reply = parseFormattedReply(value);
    const base = { ...envelope.value, ...messageExtras(value, reply, envelope.value.direction) };
    if (readString(value, 'type') === 'event') {
        return toPresenceMessage(base, parsePresenceType(value['presence']));
    }
    return ok({
        ...base,
        // An empty own text falls through to the reply's, so `??` would not do.
        text: [readString(value, 'text'), reply.fallbackText].find(Boolean) ?? '',
        content: parseFormattedContent(value),
    });
};