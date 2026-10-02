/**
 * Whether the header offers the bin that clears and leaves the conversation.
 *
 * @param state - The conversation.
 * @returns `true` only when the panel is open, its view is `conversation`,
 *   `settings.conversationClearEnabled` is `true`, and there is at least one message.
 * @remarks Pure. Part of `headerView`; tested through it.
 */
export const isClearable = (state) => {
    return (state.panel.open &&
        state.panel.view === 'conversation' &&
        state.settings?.conversationClearEnabled === true &&
        state.messages.length > 0);
};