/**
 * Whether the panel should start the conversation now, as native does with autoStart on: "the
 * conversation starts when the user expands the Messenger window".
 *
 * @param state - The conversation.
 * @returns `true` only when all hold: the panel is open, its view is `conversation`, the phase
 *   is `idle`, `settings.autoStart` is `true`, and `panel.autoStartSpent` is `false`.
 * @remarks Pure.
 */
export const autoStartDue = (state) => {
    return (state.panel.open &&
        state.panel.view === 'conversation' &&
        state.phase === 'idle' &&
        state.settings?.autoStart === true &&
        !state.panel.autoStartSpent);
};