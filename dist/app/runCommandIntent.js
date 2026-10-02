import { commandOutcome } from "./commandOutcome.js";
/**
 * Runs one attachment or end-of-conversation intent, per the `runIntent` table for these kinds.
 *
 * @param messenger - The SDK port.
 * @param intent - The intent.
 * @param emit - Receives `uploadRequested` before `requestUpload`, synchronously.
 * @returns The outcome events once the command settles; `[]` for `refreshAttachment` either way
 *   and for an empty upload list (which calls nothing). Never rejects.
 * @remarks Part of `runIntent`; tested through it.
 */
export const runCommandIntent = (messenger, intent, emit) => {
    switch (intent.kind) {
        case 'upload': {
            const first = intent.files[0];
            if (first === undefined) {
                return Promise.resolve([]);
            }
            emit({ kind: 'uploadRequested', fileName: first.name });
            return messenger
                .requestUpload(intent.files)
                .then((result) => commandOutcome(result, [], 'uploadFailed'));
        }
        case 'removeUpload':
            return messenger
                .deleteFile(intent.attachmentId)
                .then((result) => commandOutcome(result, [], 'commandFailed'));
        case 'refreshAttachment':
            // A broken image is not worth a notice, so the outcome is dropped either way.
            return messenger.getFile(intent.attachmentId).then(() => []);
        case 'reset':
            return messenger
                .resetConversation()
                .then((result) => commandOutcome(result, [], 'commandFailed'));
        case 'clear':
            return messenger
                .clearConversation()
                .then((result) => commandOutcome(result, [], 'commandFailed'));
    }
};