/**
 * Builds the open-state memory on a storage area. Native keeps its own flag in
 * `_<deploymentId>:gcmcopn`; Genesys' storage docs say not to touch its keys, so ours has its own.
 *
 * @param getStorage - Returns the storage to use (the page passes `() => window.localStorage`).
 *   Called on every `remember` and `recall`, never at build time.
 * @param key - The storage key, unique per deployment.
 * @returns `remember(open)` stores `'true'` or `'false'` under `key`; `recall()` is `true` only
 *   when the stored value is exactly `'true'`.
 * @remarks Never throws: storage can be missing or refuse access (a sandboxed frame, a full or
 *   disabled store), and `getStorage` itself can throw; then `remember` does nothing and `recall`
 *   returns `false`.
 */
export const makeOpenMemory = (getStorage, key) => ({
    remember: (open) => {
        try {
            getStorage().setItem(key, open ? 'true' : 'false');
        }
        catch {
            // Storage refused or missing: remembering is best-effort, so the panel just won't restore.
        }
    },
    recall: () => {
        try {
            return getStorage().getItem(key) === 'true';
        }
        catch {
            return false;
        }
    },
});