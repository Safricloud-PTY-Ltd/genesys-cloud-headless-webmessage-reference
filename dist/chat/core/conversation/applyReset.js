import { initialConversation } from "./initialConversation.js";
/**
 * Starts over after the conversation or session is cleared or reset.
 *
 * @param state - The conversation before the event.
 * @param event - Any conversation event; this handler acts on some kinds and passes the rest.
 * @returns For `conversationCleared` and `sessionCleared`: `initialConversation` with the current
 *   `settings`, `filePolicy`, `lookAndFeel` and `panel` kept (`applyPanel` decides what the panel
 *   does next). For `conversationReset`: the same, but with `phase`
 *   `active` (the reset opens a new session). A `messagesReceived` holding a message with
 *   `presence: 'Clear'` is treated as `conversationCleared`: the SDK delivers that presence after
 *   `conversationCleared` (sdk-source-notes.md, "Observed in a live session"), and without this it
 *   would land in the emptied transcript as a lone row.
 * @remarks Pure. Returns `state` itself (same reference) for every other event kind.
 */
export const applyReset = (state, event) => {
    const kept = {
        ...(state.settings === undefined ? {} : { settings: state.settings }),
        ...(state.filePolicy === undefined ? {} : { filePolicy: state.filePolicy }),
        ...(state.lookAndFeel === undefined ? {} : { lookAndFeel: state.lookAndFeel }),
        panel: state.panel,
    };
    const cleared = ['conversationCleared', 'sessionCleared'].includes(event.kind) ||
        (event.kind === 'messagesReceived' && event.messages.some((m) => m.presence === 'Clear'));
    if (cleared) {
        return { ...initialConversation, ...kept };
    }
    if (event.kind === 'conversationReset') {
        return { ...initialConversation, ...kept, phase: 'active' };
    }
    return state;
};