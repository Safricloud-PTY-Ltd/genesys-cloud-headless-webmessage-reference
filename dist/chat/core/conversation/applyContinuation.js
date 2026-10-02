/**
 * Notices that a conversation disconnected in `Send` mode has carried on.
 *
 * @param state - The conversation after the transcript handler has run for the event.
 * @param event - Any conversation event. Only a messages event (`restored`, `messagesReceived`,
 *   `oldMessages`, `messagesUpdated`) can show that the conversation carried on.
 * @returns For a messages event, `disconnected` or `readOnly` → `active` when the transcript's latest message without `presence` is
 *   later than its latest message with `presence: 'Disconnect'`; `state` itself otherwise
 *   (a new conversation after a reset, carried past an old Disconnect that a restore republished;
 *   including every other phase, a transcript with no Disconnect message yet, and every other event:
 *   `conversationDisconnected` arrives before its own Disconnect row, so judging it from the
 *   transcript would undo the disconnect it reports).
 * @remarks Pure. After a Send-mode Disconnect the next message starts a new conversation without
 *   any `started` event, and on restore the SDK republishes old Disconnects before the history
 *   arrives (sdk-source-notes.md, "What is filtered, and what is not"). Deciding from the
 *   transcript covers the live continuation, restore and fetched history alike; a Disconnect that
 *   is newer than every message keeps the conversation `disconnected`.
 */
export const applyContinuation = (state, event) => {
    const isMessagesEvent = [
        'restored',
        'messagesReceived',
        'oldMessages',
        'messagesUpdated',
    ].includes(event.kind);
    const isEnded = ['disconnected', 'readOnly'].includes(state.phase);
    if (!isEnded || !isMessagesEvent)
        return state;
    const lastDisconnect = state.messages.reduce((latest, m) => (m.presence === 'Disconnect' ? Math.max(latest, m.time) : latest), -Infinity);
    const lastPlain = state.messages.reduce((latest, m) => (m.presence === undefined ? Math.max(latest, m.time) : latest), -Infinity);
    return lastDisconnect > -Infinity && lastPlain > lastDisconnect
        ? { ...state, phase: 'active' }
        : state;
};