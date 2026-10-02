/**
 * Decides what the composer area offers.
 *
 * @param state - The conversation.
 * @returns `readOnly` when the phase is `readOnly`; `compose` in every other phase. Native has no
 *   Start button: in `idle` the first message starts the conversation (`sendMessage` opens a
 *   session when none exists, messaging-service.md), and in `disconnected` (Send mode) it starts
 *   a new one.
 * @remarks Pure.
 */
export const composerMode = (state) => {
    return state.phase === 'readOnly' ? 'readOnly' : 'compose';
};