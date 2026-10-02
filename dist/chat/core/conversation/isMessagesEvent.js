/**
 * Tells whether an event carries messages: `restored`, `messagesReceived`, `oldMessages` or
 * `messagesUpdated`.
 *
 * @param event - Any conversation event.
 * @returns `true` for those four kinds.
 * @remarks Pure. Part of the conversation handlers; tested through them.
 */
export const isMessagesEvent = (event) => {
    return (event.kind === 'restored' ||
        event.kind === 'messagesReceived' ||
        event.kind === 'oldMessages' ||
        event.kind === 'messagesUpdated');
};