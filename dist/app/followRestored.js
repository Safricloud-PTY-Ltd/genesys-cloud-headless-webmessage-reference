import { attachmentIdsOf } from '#chat';
/**
 * Does what a restored conversation needs beyond showing it: fresh attachment links, and the
 * panel reopened when it was open before the reload.
 *
 * @param wiring - The port, the window and the open-state memory.
 * @param messages - The restored messages.
 * @remarks `messenger.refreshFiles(attachmentIdsOf(messages))` once, unless there are no ids,
 *   ignoring the outcome (restored download URLs may have expired; gotchas.md, "Attachments").
 *   Then, when `openMemory.recall()` is `true`, `chat.receive({ kind: 'panelRestored' })`, which
 *   reopens a closed panel on the conversation and does nothing while it is open (`restored`
 *   repeats after every reconnect).
 *   Part of `connectChat`; tested through it.
 */
export const followRestored = (wiring, messages) => {
    const ids = attachmentIdsOf(messages);
    if (ids.length > 0) {
        void wiring.messenger.refreshFiles(ids);
    }
    if (wiring.openMemory.recall()) {
        wiring.chat.receive({ kind: 'panelRestored' });
    }
};