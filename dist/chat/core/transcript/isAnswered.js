/**
 * Tells whether the customer has already answered an outbound date picker, list picker or form,
 * so the UI doesn't offer it twice. The SDK's `consumed` flag is page-session memory only, so it
 * is one signal among three (structured-messages.md, "Recognising an answered picker or form").
 *
 * @param state - The conversation.
 * @param messageId - The outbound message carrying the picker or form.
 * @returns `true` when that message is `consumed`, when `state.answered` contains the id, or
 *   when any message in the transcript has `replyTo` equal to it; otherwise `false`, including
 *   for an id not in the transcript.
 * @remarks Pure.
 */
export const isAnswered = (state, messageId) => {
    return (state.messages.some((message) => message.id === messageId && message.consumed === true) ||
        state.answered.includes(messageId) ||
        state.messages.some((message) => message.replyTo === messageId));
};