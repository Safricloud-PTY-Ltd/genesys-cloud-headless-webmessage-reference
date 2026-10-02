/**
 * Hands the deployment settings to the chat window.
 *
 * @param wiring - The port, the window and the warning sink.
 * @returns A promise settled once done. Never rejects.
 * @remarks Calls `messenger.readSettings()` once. Success → `chat.receive({ kind:
 *   'settingsLoaded', settings })`. Failure → `warn('Could not read the Messenger deployment
 *   settings', error)` and nothing else (the UI keeps attachments and typing off). Part of
 *   `connectChat`; tested through it.
 */
export const loadSettings = (wiring) => {
    return wiring.messenger.readSettings().then((result) => {
        if (result.ok) {
            wiring.chat.receive({ kind: 'settingsLoaded', settings: result.value });
        }
        else {
            wiring.warn('Could not read the Messenger deployment settings', result.error);
        }
    });
};