import { isRecord } from '#shared';
import { chatIntentEvent } from '#chat';
import { followRestored } from "./followRestored.js";
import { loadLookAndFeel } from "./loadLookAndFeel.js";
import { loadSettings } from "./loadSettings.js";
import { rememberIntent } from "./rememberIntent.js";
import { runIntent } from "./runIntent.js";
/**
 * Connects the SDK port to the chat window: SDK events in, customer intents out.
 *
 * @param wiring - The port, the window, the warning sink and the open-state memory.
 * @returns A function that undoes the wiring (unsubscribes and removes the listener); calling it
 *   twice is harmless.
 * @remarks Every `Messenger` event goes to `chat.receive`. On `ready` it also calls
 *   `readSettings()`: success → `chat.receive({ kind: 'settingsLoaded', settings })`; failure →
 *   `warn` and nothing else (the UI then keeps attachments and typing off). On `restored` it
 *   calls `refreshFiles(attachmentIdsOf(messages))` once, unless there are no ids, ignoring the
 *   outcome: restored history carries download URLs
 *   that may have expired (gotchas.md, "Attachments"). Every
 *   `chatIntentEvent` the window emits that is a `CustomEvent` with an object `detail` is handed
 *   to `runIntent(messenger, detail, chat.receive)`; others are ignored.
 *
 *   Look and feel: once, while wiring, `readLookAndFeel()`: success → `chat.receive({ kind:
 *   'lookAndFeelLoaded', lookAndFeel })`; failure → `warn`, then the same event with
 *   `nativeLookAndFeel` (from `#messenger`), so the launcher still appears, in Genesys' default look.
 *
 *   Open state, as native keeps it (native-messenger-behaviour.md): an `open` intent →
 *   `openMemory.remember(true)`, a `minimise` intent → `remember(false)`, both before the intent
 *   runs; a `conversationCleared` or `sessionCleared` event → `remember(false)` (a Clear closes the
 *   panel). On `restored`, when `openMemory.recall()` is `true`: `chat.receive({ kind:
 *   'panelRestored' })`, so a reload mid-conversation reopens the panel on the conversation (a
 *   repeat `restored` after a reconnect changes nothing). A page with no
 *   conversation to restore starts closed.
 */
export const connectChat = (wiring) => {
    const { messenger, chat, openMemory } = wiring;
    void loadLookAndFeel(wiring);
    const unsubscribe = messenger.subscribe((event) => {
        chat.receive(event);
        if (event.kind === 'ready') {
            void loadSettings(wiring);
        }
        if (event.kind === 'conversationCleared' || event.kind === 'sessionCleared') {
            openMemory.remember(false);
        }
        if (event.kind === 'restored') {
            followRestored(wiring, event.messages);
        }
    });
    // An abort signal removes the listener on undo without needing a named reference to it.
    const listening = new AbortController();
    chat.addEventListener(chatIntentEvent, (event) => {
        if (event instanceof CustomEvent && isRecord(event.detail)) {
            // Trusted internal boundary: only our own elements dispatch `chat-intent`.
            const intent = event.detail;
            rememberIntent(openMemory, intent);
            void runIntent(messenger, intent, (local) => {
                chat.receive(local);
            });
        }
    }, { signal: listening.signal });
    return () => {
        unsubscribe();
        listening.abort();
    };
};