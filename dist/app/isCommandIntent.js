const commandKinds = new Set([
    'upload',
    'removeUpload',
    'refreshAttachment',
    'reset',
    'clear',
]);
/**
 * Whether an intent is about the attachment or the conversation's end.
 *
 * @param intent - Any intent.
 * @returns `true` for `upload`, `removeUpload`, `refreshAttachment`, `reset` and `clear`; `false`
 *   otherwise.
 * @remarks Pure. Part of `runIntent`; tested through it.
 */
export const isCommandIntent = (intent) => {
    return commandKinds.has(intent.kind);
};