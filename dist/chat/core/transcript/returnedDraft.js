/**
 * Finds the text a failed send should give back to the composer.
 *
 * @param state - The conversation before the event.
 * @param event - Any conversation event.
 * @returns For `draftReturned`, its `text`. For an `error` with a `tracingId`, the `text` of the
 *   pending entry with that `tracingId` in `state`, unless that entry has a `replyTo`: a picker or
 *   form answer's text is the reply's title, not the customer's words. `undefined` for every other event, when no
 *   pending entry matches, or when the text found is empty (an attachment-only send).
 * @remarks Pure. Read the state *before* reducing the event: the reducer drops that pending entry.
 */
export const returnedDraft = (state, event) => {
    const entry = event.kind === 'error'
        ? state.pending.find((pending) => pending.tracingId === event.tracingId)
        : undefined;
    const text = event.kind === 'draftReturned'
        ? event.text
        : entry?.replyTo === undefined
            ? entry?.text
            : undefined;
    return text === '' ? undefined : text;
};