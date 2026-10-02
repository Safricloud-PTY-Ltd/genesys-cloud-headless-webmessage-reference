/**
 * Runs one panel intent, per the `runIntent` table for these kinds.
 *
 * @param intent - The intent.
 * @param emit - Receives the one local event, synchronously: `open` → `panelOpened`; `minimise`
 *   → `panelMinimised`; `showConversation` → `homeLeft`; `showHome` → `homeReturned`.
 * @returns A promise of `[]`, already resolved: the event went out through `emit` at once, so the
 *   panel redraws in the same task as the click. Never rejects.
 * @remarks Part of `runIntent`; tested through it.
 */
export const runPanelIntent = (intent, emit) => {
    const eventKinds = {
        open: 'panelOpened',
        minimise: 'panelMinimised',
        showConversation: 'homeLeft',
        showHome: 'homeReturned',
    };
    emit({ kind: eventKinds[intent.kind] });
    return Promise.resolve([]);
};