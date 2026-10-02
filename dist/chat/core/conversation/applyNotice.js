/**
 * Raises and clears the notice shown above the composer.
 *
 * @param state - The conversation before the event.
 * @param event - Any conversation event; this handler acts on some kinds and passes the rest.
 * @returns `startFailed`, `historyFailed`, `uploadFailed`, `sendFailed` and `commandFailed` → a notice of
 *   the same kind with the event's `detail`; `fileUploadError` → `uploadFailed` with its
 *   `message`; `error` → `serverError` with its `message`; `noticeDismissed` → no notice. A new
 *   notice replaces the old one.
 * @remarks Pure. Returns `state` itself (same reference) for every other event kind.
 */
export const applyNotice = (state, event) => {
    // Only the five local failure events carry `detail`, so this narrows `kind` to a NoticeKind.
    if ('detail' in event) {
        return { ...state, notice: { kind: event.kind, detail: event.detail } };
    }
    if (event.kind === 'fileUploadError') {
        return { ...state, notice: { kind: 'uploadFailed', detail: event.message } };
    }
    if (event.kind === 'error') {
        return { ...state, notice: { kind: 'serverError', detail: event.message } };
    }
    if (event.kind === 'noticeDismissed') {
        const { notice: _dismissed, ...rest } = state;
        return rest;
    }
    return state;
};