import { isReplayedDisconnect } from "./isReplayedDisconnect.js";
import { phaseTransitions } from "./phaseTransitions.js";
/**
 * Moves the conversation between idle, starting, active, disconnected and read-only.
 *
 * @param state - The conversation before the event.
 * @param event - Any conversation event; this handler acts on some kinds and passes the rest.
 * @returns `startRequested` → `starting` (only from `idle` or `disconnected`); `startFailed` →
 *   `idle` (only from `starting`); `started` → `readOnly` when its `readOnly` is set, else
 *   `active`; `restored` → `active` when the phase is `idle` or `starting`;
 *   `conversationDisconnected` → `readOnly` when its `readOnly` is set, else `disconnected`, except
 *   that it never leaves `readOnly` (a re-published old disconnect may carry no `readOnly` flag),
 *   and that a replayed one (`isReplayedDisconnect(state, event.time)`) changes nothing;
 *   `readOnlyConversation` → `readOnly`.
 * @remarks Pure. Idempotent per event: the SDK re-publishes `conversationDisconnected` for old disconnects in history (sdk-source-notes.md). Returns `state` itself for every other event kind.
 */
export const applyPhase = (state, event) => {
    if (event.kind === 'conversationDisconnected' && isReplayedDisconnect(state, event.time)) {
        return state;
    }
    const readOnly = 'readOnly' in event && event.readOnly;
    const transition = phaseTransitions(readOnly)[event.kind];
    return transition?.from.includes(state.phase) === true
        ? { ...state, phase: transition.to }
        : state;
};