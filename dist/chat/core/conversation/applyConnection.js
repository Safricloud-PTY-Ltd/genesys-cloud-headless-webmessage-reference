/**
 * Tracks the socket's health.
 *
 * @param state - The conversation before the event.
 * @param event - Any conversation event; this handler acts on some kinds and passes the rest.
 * @returns `offline` → `offline`; `reconnecting` → `reconnecting`; `reconnected` → `online`.
 * @remarks Pure. Returns `state` itself (same reference) for every other event kind.
 */
export const applyConnection = (state, event) => {
    if (event.kind === 'offline') {
        return { ...state, connection: 'offline' };
    }
    if (event.kind === 'reconnecting') {
        return { ...state, connection: 'reconnecting' };
    }
    if (event.kind === 'reconnected') {
        return { ...state, connection: 'online' };
    }
    return state;
};