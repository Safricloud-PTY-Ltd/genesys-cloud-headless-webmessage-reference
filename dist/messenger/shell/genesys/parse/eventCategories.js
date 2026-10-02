/**
 * Every `MessagingService` event the reference subscribes to, and which parser reads it. Typed
 * as a full record so adding a `MessengerEvent` kind without a parser fails to compile.
 */
export const eventCategories = {
    restored: 'messages',
    messagesReceived: 'messages',
    oldMessages: 'messages',
    messagesUpdated: 'messages',
    ready: 'signal',
    historyComplete: 'signal',
    typingTimeout: 'signal',
    offline: 'signal',
    reconnecting: 'signal',
    reconnected: 'signal',
    conversationCleared: 'signal',
    sessionCleared: 'signal',
    started: 'lifecycle',
    conversationDisconnected: 'lifecycle',
    conversationReset: 'lifecycle',
    readOnlyConversation: 'lifecycle',
    sessionTimingUpdated: 'session',
    sessionWarning: 'session',
    typingReceived: 'session',
    uploading: 'file',
    fileUploaded: 'file',
    fileUploadError: 'file',
    fileDeleted: 'file',
    allowedFileTypes: 'file',
    sendingMessage: 'sending',
    error: 'error',
};
/**
 * The event names to subscribe to. `Object.keys` loses the key type; the record's type above
 * guarantees every key is a `MessengerEventName`.
 */
export const messengerEventNames = Object.keys(eventCategories);