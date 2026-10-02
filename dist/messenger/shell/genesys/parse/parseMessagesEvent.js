import { ok } from '#shared';
import { parseFormattedMessage } from "./parseFormattedMessage.js";
import { parseMessageList } from "./parseMessageList.js";
import { parseRawMessage } from "./parseRawMessage.js";
/**
 * Parses the payload of an event that carries messages.
 *
 * @param name - `messagesReceived` (raw Guest API bodies, via `parseRawMessage`), `restored`
 *   or `oldMessages` (formatted, `messages` field, via `parseFormattedMessage`), or
 *   `messagesUpdated` (formatted, `updatedMessages` field).
 * @param data - The envelope's `data`, untrusted.
 * @returns The event with the messages that parsed, in payload order (`parseMessageList`).
 * @errors InvalidPayload - when `parseMessageList` rejects the payload.
 * @remarks Pure.
 */
export const parseMessagesEvent = (name, data) => {
    const key = name === 'messagesUpdated' ? 'updatedMessages' : 'messages';
    const parse = name === 'messagesReceived' ? parseRawMessage : parseFormattedMessage;
    const list = parseMessageList(data, key, parse);
    return list.ok ? ok({ kind: name, messages: list.value }) : list;
};