import { commandOutcome } from "./commandOutcome.js";
import { postbackOutcome } from "./postbackOutcome.js";
/**
 * Runs one conversation intent, per the `runIntent` table for these kinds.
 *
 * @param messenger - The SDK port.
 * @param intent - The intent.
 * @param emit - Receives the events raised before the command (`startRequested`,
 *   `historyRequested`, `noticeDismissed`), synchronously.
 * @returns The outcome events (from `commandOutcome`), once the command settles; `[]` for
 *   `typing` and `dismissNotice`. Never rejects.
 * @remarks Part of `runIntent`; tested through it.
 */
export const runConversationIntent = (messenger, intent, emit) => {
    switch (intent.kind) {
        case 'start':
            emit({ kind: 'startRequested' });
            return messenger
                .startConversation()
                .then((result) => commandOutcome(result, [], 'startFailed'));
        case 'send':
            return messenger
                .sendMessage(intent.text)
                .then((result) => [
                ...commandOutcome(result, [{ kind: 'messageSubmitted' }], 'sendFailed'),
                ...(result.ok ? [] : [{ kind: 'draftReturned', text: intent.text }]),
            ]);
        case 'postback':
            return messenger
                .sendPostback(intent.postback)
                .then((result) => postbackOutcome(result, intent.postback));
        case 'typing':
            messenger.sendTyping();
            return Promise.resolve([]);
        case 'loadOlder':
            emit({ kind: 'historyRequested' });
            return messenger
                .fetchHistory()
                .then((result) => commandOutcome(result, [{ kind: 'historySettled' }], 'historyFailed'));
        case 'dismissNotice':
            emit({ kind: 'noticeDismissed' });
            return Promise.resolve([]);
    }
};