import { readString } from '#shared';
import { parseRawReply } from "./parseRawReply.js";
/**
 * Reads what an outgoing frame says, and which picker or form it answers.
 *
 * @param message - The `sendingMessage` frame, already narrowed to a record.
 * @returns `text`: the frame's non-empty `text`, else `parseRawReply(message).fallbackText` (a
 *   date-picker answer's frame has only its button's text), else `""`. `replyTo`: from
 *   `parseRawReply(message)`, present only when it finds one.
 * @remarks Pure. Part of `parseSendingMessage`; tested through it.
 */
export const readSendingReply = (message) => {
    const reply = parseRawReply(message);
    const text = [readString(message, 'text'), reply.fallbackText].find(Boolean) ?? '';
    return reply.replyTo === undefined ? { text } : { text, replyTo: reply.replyTo };
};