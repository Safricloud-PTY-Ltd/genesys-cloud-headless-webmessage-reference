import { strings } from "../strings.js";
/**
 * The status line at the top of the conversation, when there is something to say.
 *
 * @param state - The conversation.
 * @returns `strings.statusOffline` when offline; `strings.statusReconnecting` when reconnecting;
 *   otherwise `undefined`. An ended conversation is not a status: native says so in the
 *   transcript, after the disconnect (`renderPresence`).
 * @remarks Pure.
 */
export const statusText = (state) => {
    if (state.connection === 'offline')
        return strings.statusOffline;
    if (state.connection === 'reconnecting')
        return strings.statusReconnecting;
    return undefined;
};