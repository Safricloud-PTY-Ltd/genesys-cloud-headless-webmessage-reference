/**
 * Adds a message the SDK has just sent to the "sending" list.
 *
 * @param state - The conversation.
 * @param pending - The entry built from `sendingMessage`.
 * @returns `state` with `pending` appended, unless its `tracingId` is already pending or already
 *   on a message in the transcript (the echo can beat `sendingMessage`); then `state` itself.
 * @remarks Pure. Part of `applyTranscript`; tested through it.
 */
export const addPending = (state, pending) => {
    const known = state.pending.some((p) => p.tracingId === pending.tracingId) ||
        state.messages.some((m) => m.tracingId === pending.tracingId);
    return known ? state : { ...state, pending: [...state.pending, pending] };
};