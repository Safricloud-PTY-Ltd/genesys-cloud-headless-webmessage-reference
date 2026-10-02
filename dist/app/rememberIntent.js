/**
 * Records an intent that opens or minimises the panel.
 *
 * @param openMemory - Where the open state is kept.
 * @param intent - Any intent.
 * @remarks `open` → `remember(true)`; `minimise` → `remember(false)`; any other intent →
 *   nothing. Part of `connectChat`; tested through it.
 */
export const rememberIntent = (openMemory, intent) => {
    if (intent.kind === 'open' || intent.kind === 'minimise') {
        openMemory.remember(intent.kind === 'open');
    }
};