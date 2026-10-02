import { clearExtendedSession } from "./clearExtendedSession.js";
/**
 * Records what the page learns about the session, the deployment, and answers sent.
 *
 * @param state - The conversation before the event.
 * @param event - Any conversation event; this handler acts on some kinds and passes the rest.
 * @returns `sessionWarning` → `sessionExpiresAt` set to its `expiresAt`; `sessionTimingUpdated` →
 *   `sessionExpiresAt` removed when its `expiresAt` is later (the session was extended), kept
 *   otherwise (the SDK also publishes it on every restore and reconnect); `allowedFileTypes` → `filePolicy`
 *   from its fields; `settingsLoaded` → `settings`; `lookAndFeelLoaded` → `lookAndFeel`; `answerSubmitted` → its `messageId` added to
 *   `answered` once.
 * @remarks Pure. Returns `state` itself (same reference) for every other event kind.
 */
export const applySession = (state, event) => {
    if (event.kind === 'sessionWarning') {
        return { ...state, sessionExpiresAt: event.expiresAt };
    }
    if (event.kind === 'sessionTimingUpdated') {
        return clearExtendedSession(state, event.expiresAt);
    }
    if (event.kind === 'allowedFileTypes') {
        const { fileTypes, maxFileSizeKB, blockedExtensions } = event;
        return { ...state, filePolicy: { fileTypes, maxFileSizeKB, blockedExtensions } };
    }
    if (event.kind === 'settingsLoaded') {
        return { ...state, settings: event.settings };
    }
    if (event.kind === 'lookAndFeelLoaded') {
        return { ...state, lookAndFeel: event.lookAndFeel };
    }
    if (event.kind === 'answerSubmitted') {
        return state.answered.includes(event.messageId)
            ? state
            : { ...state, answered: [...state.answered, event.messageId] };
    }
    return state;
};