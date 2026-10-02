/**
 * Drops the upload when it fails, whichever way the failure is reported.
 *
 * @param state - The conversation before the event.
 * @param event - Any conversation event; this handler acts on some kinds and passes the rest.
 * @returns `upload` → `none` for `fileUploadError`, `uploadFailed`, and an `error` event whose
 *   `errorKey` starts with `file` in any letter case (the server's refusals: `fileTypeInvalid`,
 *   `fileTooLarge`, `fileSizeZero`, ..., and the capitalised `FileUploadUnavailable`;
 *   sdk-source-notes.md).
 * @remarks Pure. Returns `state` itself (same reference) for every other event kind.
 */
export const applyUploadFailure = (state, event) => {
    const failed = event.kind === 'fileUploadError' ||
        event.kind === 'uploadFailed' ||
        (event.kind === 'error' && event.errorKey?.toLowerCase().startsWith('file') === true);
    return failed ? { ...state, upload: { kind: 'none' } } : state;
};