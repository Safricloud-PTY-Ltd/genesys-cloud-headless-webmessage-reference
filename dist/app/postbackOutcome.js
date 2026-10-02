import { commandOutcome } from "./commandOutcome.js";
/**
 * Turns a settled `sendPostback` into the local events the conversation should see.
 *
 * @param result - What `sendPostback` returned.
 * @param postback - The postback that was sent. Date-picker, list-picker and form answers carry
 *   the `messageId` they answer; quick replies and cards don't.
 * @returns On success, `answerSubmitted` with the `messageId` when the postback has one, else
 *   `[]`. On failure, `commandOutcome(result, [], 'sendFailed')`, then `answerFailed` with the
 *   `messageId` when the postback has one, so the picker or form can be answered again.
 * @remarks Pure. Part of `runIntent`; tested through it.
 */
export const postbackOutcome = (result, postback) => {
    if (!('messageId' in postback)) {
        return commandOutcome(result, [], 'sendFailed');
    }
    const { messageId } = postback;
    return result.ok
        ? [{ kind: 'answerSubmitted', messageId }]
        : [...commandOutcome(result, [], 'sendFailed'), { kind: 'answerFailed', messageId }];
};