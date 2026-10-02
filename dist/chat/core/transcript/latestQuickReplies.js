import { canAnswer } from "./canAnswer.js";
/**
 * Picks the quick replies to offer: only those on the newest message, and only while answering
 * them still makes sense (Genesys leaves this to the UI; structured-messages.md).
 *
 * @param state - The conversation.
 * @returns The `QuickReply` content of the last message, in order, when that message is
 *   `Outbound`, nothing is pending, and `canAnswer(state)`; otherwise empty.
 * @remarks Pure.
 */
export const latestQuickReplies = (state) => {
    const last = state.messages.at(-1);
    if (last?.direction !== 'Outbound' || state.pending.length > 0 || !canAnswer(state)) {
        return [];
    }
    return last.content.flatMap((content) => content.kind === 'QuickReply' ? [content.quickReply] : []);
};