import { nativeLookAndFeel } from '#messenger';
/**
 * Hands the deployment's look and feel to the chat window, or Genesys' defaults when it can't be
 * read.
 *
 * @param wiring - The port, the window and the warning sink.
 * @returns A promise settled once the window has been told. Never rejects.
 * @remarks Calls `messenger.readLookAndFeel()` once. Success → `chat.receive({ kind:
 *   'lookAndFeelLoaded', lookAndFeel })`. Failure → `warn('Could not read the Messenger look and
 *   feel; using the default', error)`, then the same event with `nativeLookAndFeel`. Part of
 *   `connectChat`; tested through it.
 */
export const loadLookAndFeel = (wiring) => {
    return wiring.messenger.readLookAndFeel().then((result) => {
        if (!result.ok) {
            wiring.warn('Could not read the Messenger look and feel; using the default', result.error);
        }
        wiring.chat.receive({
            kind: 'lookAndFeelLoaded',
            lookAndFeel: result.ok ? result.value : nativeLookAndFeel,
        });
    });
};