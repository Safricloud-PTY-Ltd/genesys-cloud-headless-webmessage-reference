/**
 * Shows and hides the agent typing indicator.
 *
 * @param state - The conversation before the event.
 * @param event - Any conversation event; this handler acts on some kinds and passes the rest.
 * @returns `typingReceived` → `agentTyping: true`, unless `settings.showAgentTypingIndicator` is
 *   `false`; `typingTimeout` → `false`; `messagesReceived` → `false`, whatever its messages'
 *   direction: the SDK clears its own typing flag on any received message without publishing
 *   `typingTimeout` (sdk-source-notes.md, "Typing"), as Genesys' native reducer does.
 * @remarks Pure. Returns `state` itself (same reference) for every other event kind.
 */
export const applyTyping = (state, event) => {
    if (event.kind === 'typingReceived') {
        return state.settings?.showAgentTypingIndicator === false
            ? state
            : { ...state, agentTyping: true };
    }
    if (event.kind === 'typingTimeout' || event.kind === 'messagesReceived') {
        return { ...state, agentTyping: false };
    }
    return state;
};