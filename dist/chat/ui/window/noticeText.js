import { strings } from "../strings.js";
/**
 * Words for a notice.
 *
 * @param notice - The notice.
 * @returns The `strings.notice*` entry for its kind, followed by " (" + detail + ")" when the
 *   detail is non-empty.
 * @remarks Pure.
 */
export const noticeText = (notice) => {
    const text = {
        startFailed: strings.noticeStartFailed,
        sendFailed: strings.noticeSendFailed,
        historyFailed: strings.noticeHistoryFailed,
        uploadFailed: strings.noticeUploadFailed,
        commandFailed: strings.noticeCommandFailed,
        serverError: strings.noticeServerError,
    }[notice.kind];
    return notice.detail === '' ? text : `${text} (${notice.detail})`;
};