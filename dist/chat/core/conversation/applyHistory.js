/**
 * Tells whether an event means no older history can exist.
 *
 * @param event - Any conversation event.
 * @returns `true` for `historyComplete`, and for `started` with `newSession: true`.
 */
const isHistoryEnd = (event) => event.kind === 'historyComplete' || (event.kind === 'started' && event.newSession);
/**
 * Tracks whether older history can still be fetched.
 *
 * @param state - The conversation before the event.
 * @param event - Any conversation event; this handler acts on some kinds and passes the rest.
 * @returns `historyRequested` → `loading`, unless already `complete`; `oldMessages` and
 *   `historyFailed` → `available`, unless already `complete`; `historyComplete` → `complete`;
 *   `started` with `newSession: true` → `complete`, since a new conversation has no history;
 *   `historySettled` → `available` when `loading` (the SDK resolves `fetchHistory` without
 *   publishing a page while offline; sdk-source-notes.md), otherwise unchanged.
 *   `conversationReset`, `conversationCleared` and `sessionCleared` are not handled here.
 * @remarks Pure. Returns `state` itself (same reference) for every other event kind.
 */
export const applyHistory = (state, event) => {
    if (isHistoryEnd(event)) {
        return { ...state, history: 'complete' };
    }
    if (state.history === 'complete') {
        return state;
    }
    if (event.kind === 'historyRequested') {
        return { ...state, history: 'loading' };
    }
    if (event.kind === 'oldMessages' || event.kind === 'historyFailed') {
        return { ...state, history: 'available' };
    }
    if (event.kind === 'historySettled' && state.history === 'loading') {
        return { ...state, history: 'available' };
    }
    return state;
};