import { isCommandIntent } from "./isCommandIntent.js";
import { isPanelIntent } from "./isPanelIntent.js";
import { runCommandIntent } from "./runCommandIntent.js";
import { runConversationIntent } from "./runConversationIntent.js";
import { runPanelIntent } from "./runPanelIntent.js";
/**
 * Carries out what the customer asked for: one `Messenger` command, with the local events that
 * keep the UI honest while it runs and after it settles.
 *
 * @param messenger - The SDK port.
 * @param intent - From a `chat-intent` event.
 * @param emit - Receives local events, in order; called synchronously for events raised before
 *   the command, and after the command settles for its outcome (`commandOutcome`).
 * @returns A promise settled once every event for this intent has been emitted. Never rejects.
 * @remarks Per intent:
 *   - `start`: emit `startRequested`; `startConversation`; failure → `startFailed`.
 *   - `send`: `sendMessage(text)`; success → `messageSubmitted`; failure → `sendFailed`, then
 *     `draftReturned` with the text.
 *   - `postback`: `sendPostback(postback)`; success → `answerSubmitted` with the postback's
 *     `messageId` when it has one (date picker, list picker, form), else nothing; failure →
 *     `sendFailed`, then `answerFailed` with that `messageId` when it has one.
 *   - `typing`: `sendTyping()`; nothing emitted.
 *   - `loadOlder`: emit `historyRequested`; `fetchHistory`; success → `historySettled`; failure →
 *     `historyFailed`.
 *   - `upload`: emit `uploadRequested` with the first file's name; `requestUpload(files)`;
 *     failure → `uploadFailed`. An empty list emits nothing and calls no command.
 *   - `removeUpload`: `deleteFile(id)`; failure → `commandFailed`.
 *   - `refreshAttachment`: `getFile(id)`; nothing emitted either way (a broken image is not worth
 *     a notice).
 *   - `reset`: `resetConversation`; `clear`: `clearConversation`; failure → `commandFailed`.
 *   - `dismissNotice`: emit `noticeDismissed`; no command.
 *   - `open`, `minimise`, `showConversation`, `showHome`: `runPanelIntent`; no command.
 *   Upload, removeUpload, refreshAttachment, reset and clear go through `runCommandIntent`; the
 *   panel kinds through `runPanelIntent`; the rest through `runConversationIntent`.
 */
export const runIntent = (messenger, intent, emit) => {
    const outcome = isPanelIntent(intent)
        ? runPanelIntent(intent, emit)
        : isCommandIntent(intent)
            ? runCommandIntent(messenger, intent, emit)
            : runConversationIntent(messenger, intent, emit);
    return outcome.then((events) => {
        events.forEach(emit);
    });
};