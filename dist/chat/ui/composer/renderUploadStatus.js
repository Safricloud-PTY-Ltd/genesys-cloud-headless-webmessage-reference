import { makeIconButton } from "../makeIconButton.js";
import { strings } from "../strings.js";
/**
 * Shows the file the customer is uploading or has staged, under the composer's buttons.
 *
 * @param upload - The upload state.
 * @param document - The document to create it with.
 * @param remove - Called with the attachment id when the customer removes a staged file.
 * @returns A `<div class="upload">`: while `uploading`, a `<span class="file-name">` of the file
 *   name and a `<progress max="100">` of the percentage, named `strings.uploading + ' ' +
 *   fileName` (`aria-label`); when `staged`, the file name span and
 *   `makeIconButton('close', strings.removeFile)` calling `remove(attachmentId)`; for `none`,
 *   empty and `hidden`.
 * @remarks Sets no `innerHTML`.
 */
export const renderUploadStatus = (upload, document, remove) => {
    const status = document.createElement('div');
    status.className = 'upload';
    if (upload.kind === 'none') {
        status.hidden = true;
        return status;
    }
    const fileName = document.createElement('span');
    fileName.className = 'file-name';
    fileName.textContent = upload.fileName;
    if (upload.kind === 'uploading') {
        const progress = document.createElement('progress');
        progress.max = 100;
        progress.value = upload.percentage;
        progress.setAttribute('aria-label', `${strings.uploading} ${upload.fileName}`);
        status.append(fileName, progress);
        return status;
    }
    const button = makeIconButton(document, 'close', strings.removeFile);
    button.addEventListener('click', () => {
        remove(upload.attachmentId);
    });
    status.append(fileName, button);
    return status;
};