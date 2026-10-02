const panelKinds = new Set([
    'open',
    'minimise',
    'showConversation',
    'showHome',
]);
/**
 * Whether an intent only moves the messenger panel.
 *
 * @param intent - Any intent.
 * @returns `true` for `open`, `minimise`, `showConversation` and `showHome`; `false` otherwise.
 * @remarks Pure. Part of `runIntent`; tested through it.
 */
export const isPanelIntent = (intent) => {
    return panelKinds.has(intent.kind);
};