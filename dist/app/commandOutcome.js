/**
 * Turns a command's result into the local events the conversation should see.
 *
 * @param result - What the `Messenger` command returned.
 * @param onOk - Events for success. May be empty.
 * @param failure - The event kind for failure.
 * @returns `onOk` on success. On failure, one `failure` event whose `detail` is the rejection's
 *   `reason`, or for a timeout "No response from Messenger after N s" (N = `afterMs` / 1000,
 *   rounded).
 * @remarks Pure.
 */
export const commandOutcome = (result, onOk, failure) => {
    if (result.ok) {
        return onOk;
    }
    const detail = result.error.kind === 'CommandRejected'
        ? result.error.reason
        : `No response from Messenger after ${String(Math.round(result.error.afterMs / 1000))} s`;
    return [{ kind: failure, detail }];
};