/**
 * The upload's progress half: `uploadRequested`, `uploading` and `fileUploaded`, as `applyUpload`
 * describes them.
 *
 * @param state - The conversation before the event.
 * @param event - Any conversation event.
 * @returns The new state for those three kinds; `state` itself for every other kind.
 */
const applyUploadProgress = (state, event) => {
    const upload = state.upload;
    if (event.kind === 'uploadRequested') {
        return { ...state, upload: { kind: 'uploading', fileName: event.fileName, percentage: 0 } };
    }
    if (event.kind === 'uploading') {
        return upload.kind === 'uploading'
            ? { ...state, upload: { ...upload, percentage: event.percentage } }
            : state;
    }
    if (event.kind === 'fileUploaded') {
        const fileName = upload.kind === 'uploading' ? upload.fileName : '';
        return { ...state, upload: { kind: 'staged', fileName, attachmentId: event.attachmentId } };
    }
    return state;
};
/**
 * The upload's clearing half: `fileDeleted` and `messageSubmitted` against a staged file, as
 * `applyUpload` describes them.
 *
 * @param state - The conversation before the event.
 * @param event - Any conversation event.
 * @returns `upload: none` when the staged file is deleted or sent; `state` itself otherwise.
 */
const applyUploadCleared = (state, event) => {
    const upload = state.upload;
    const cleared = upload.kind === 'staged' &&
        (event.kind === 'messageSubmitted' ||
            (event.kind === 'fileDeleted' && event.attachmentId === upload.attachmentId));
    return cleared ? { ...state, upload: { kind: 'none' } } : state;
};
/**
 * Follows the customer's one staged upload through its successful path.
 *
 * @param state - The conversation before the event.
 * @param event - Any conversation event; this handler acts on some kinds and passes the rest.
 * @returns `uploadRequested` → `uploading` at 0 % with the file name; `uploading` → its percentage,
 *   only while uploading; `fileUploaded` → `staged` with the attachment id and the uploading file's
 *   name (`""` if none was uploading); `fileDeleted` → `none` when it names the staged attachment;
 *   `messageSubmitted` → `none` when a file is staged (it went with the message).
 * @remarks Pure. Returns `state` itself (same reference) for every other event kind.
 */
export const applyUpload = (state, event) => {
    return applyUploadCleared(applyUploadProgress(state, event), event);
};