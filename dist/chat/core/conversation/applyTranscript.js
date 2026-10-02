import { dropDelivered, mergeMessages } from "../transcript/index.js";
import { addPending } from "./addPending.js";
import { dropPending } from "./dropPending.js";
import { isMessagesEvent } from "./isMessagesEvent.js";
/**
 * Keeps the transcript and the "sending" list in step with message events.
 *
 * @param state - The conversation before the event.
 * @param event - Any conversation event; this handler acts on some kinds and passes the rest.
 * @returns For `restored`, `messagesReceived`, `oldMessages` and `messagesUpdated`: `messages` merged with
 *   the event's messages by `mergeMessages`, leaving out any with `presence: 'Clear'` (a marker
 *   that the conversation was cleared, which `applyReset` acts on, never a transcript row), and `pending` cleared of delivered ones by
 *   `dropDelivered`; for `restored` (the server's snapshot after a connect), `pending` emptied, since
 *   a send cut off by a dropped socket never echoes. For `sendingMessage`: a pending entry `{ tracingId, text, attachmentIds,
 *   replyTo? }`
 *   appended, unless its `tracingId` is already pending or already on a message in the transcript
 *   (the echo can beat the event). For an `error` with a `tracingId`: the pending entry with that
 *   `tracingId` removed, since the server refused that send (its text goes back to the composer
 *   through `returnedDraft`).
 * @remarks Pure. Returns `state` itself (same reference) for every other event kind.
 */
export const applyTranscript = (state, event) => {
    if (isMessagesEvent(event)) {
        const kept = event.messages.filter((m) => m.presence !== 'Clear');
        return {
            ...state,
            messages: mergeMessages(state.messages, kept),
            pending: event.kind === 'restored' ? [] : dropDelivered(state.pending, kept),
        };
    }
    if (event.kind === 'sendingMessage') {
        return addPending(state, {
            tracingId: event.tracingId,
            text: event.text,
            attachmentIds: event.attachmentIds,
            ...(event.replyTo === undefined ? {} : { replyTo: event.replyTo }),
        });
    }
    return event.kind === 'error' ? dropPending(state, event.tracingId) : state;
};