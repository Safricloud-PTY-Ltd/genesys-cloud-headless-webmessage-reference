/**
 * Takes a send the server refused off the "sending" list.
 *
 * @param state - The conversation.
 * @param tracingId - The refused frame's `tracingId`; `undefined` when the error named none.
 * @returns `state` without the pending entry with that `tracingId`, and, when that entry has a
 *   `replyTo`, without that id in `answered`, so the refused picker or form can be answered again;
 *   `state` itself when `tracingId` is `undefined` or matches no pending entry.
 * @remarks Pure. Part of `applyTranscript`; tested through it.
 */
export const dropPending = (state, tracingId) => {
    const dropped = state.pending.find((p) => p.tracingId === tracingId);
    if (dropped === undefined) {
        return state;
    }
    return {
        ...state,
        pending: state.pending.filter((p) => p.tracingId !== tracingId),
        answered: dropped.replyTo === undefined
            ? state.answered
            : state.answered.filter((m) => m !== dropped.replyTo),
    };
};