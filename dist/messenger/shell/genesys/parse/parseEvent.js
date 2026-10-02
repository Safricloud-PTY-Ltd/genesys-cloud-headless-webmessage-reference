import { ok } from '#shared';
import { eventCategories } from "./eventCategories.js";
import { parseErrorEvent } from "./parseErrorEvent.js";
import { parseFileEvent } from "./parseFileEvent.js";
import { parseLifecycleEvent } from "./parseLifecycleEvent.js";
import { parseMessagesEvent } from "./parseMessagesEvent.js";
import { parseSendingMessage } from "./parseSendingMessage.js";
import { parseSessionEvent } from "./parseSessionEvent.js";
import { readEnvelopeData } from "./readEnvelopeData.js";
/**
 * Parses one `MessagingService` event as the `Genesys` queue delivers it.
 *
 * @param name - The event's short name (`messagesReceived`), one the shell subscribed to.
 * @param envelope - The subscribe callback's argument, untrusted: `{ event, data, ... }`. Only
 *   `data` is read (`eventName` is missing on replays); a missing `data` reads as `{}`.
 * @returns The parsed event, from the parser `eventCategories[name]` names: `messages` →
 *   `parseMessagesEvent`; `signal` → the event with no fields; `lifecycle` →
 *   `parseLifecycleEvent`; `session` → `parseSessionEvent`; `file` → `parseFileEvent`;
 *   `sending` → `parseSendingMessage`; `error` → `parseErrorEvent`. `undefined` when the category's
 *   parser says nothing happened.
 * @errors InvalidPayload - whatever the category's parser rejects.
 * @remarks Pure.
 */
export const parseEvent = (name, envelope) => {
    const data = readEnvelopeData(envelope);
    // The casts are safe: eventCategories maps each name to the category whose parser accepts it.
    switch (eventCategories[name]) {
        case 'messages':
            return parseMessagesEvent(name, data);
        case 'signal':
            return ok({ kind: name });
        case 'lifecycle':
            return parseLifecycleEvent(name, data);
        case 'session':
            return parseSessionEvent(name, data);
        case 'file':
            return parseFileEvent(name, data);
        case 'sending':
            return parseSendingMessage(data);
        case 'error':
            return ok(parseErrorEvent(data));
    }
};