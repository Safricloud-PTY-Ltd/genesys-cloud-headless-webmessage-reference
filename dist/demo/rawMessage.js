import { rawPayload } from "./rawPayload.js";
/**
 * Builds a message body the way Genesys publishes it in `messagesReceived`
 * (docs/guides/sdk-source-notes.md), so the demo exercises the same parser as a real deployment.
 *
 * @param fields - The message.
 * @returns `{ id, type, direction, text?, content?, channel: { time: ISO, messageId?, from },
 *   metadata, originatingEntity?, tracingId? }` with `type` `Structured` when there is content,
 *   else `Text`; `channel.messageId` = id for inbound only; `channel.from` = `{ nickname: 'Demo
 *   bot' }` and `originatingEntity` = `Bot` for outbound, `{}` and absent for inbound;
 *   `metadata` holding `parentMessageId` when given. With `presence`: `type: 'Event'`, no text or
 *   content, and `events: [{ eventType: 'Presence', presence: { type: presence } }]`.
 * @remarks Pure.
 */
export const rawMessage = (fields) => {
    const time = new Date(fields.time).toISOString();
    const sender = fields.direction === 'Inbound'
        ? { channel: { time, messageId: fields.id, from: {} } }
        : { channel: { time, from: { nickname: 'Demo bot' } }, originatingEntity: 'Bot' };
    return {
        id: fields.id,
        direction: fields.direction,
        ...rawPayload(fields),
        ...sender,
        metadata: fields.parentMessageId === undefined ? {} : { parentMessageId: fields.parentMessageId },
        ...(fields.tracingId === undefined ? {} : { tracingId: fields.tracingId }),
    };
};