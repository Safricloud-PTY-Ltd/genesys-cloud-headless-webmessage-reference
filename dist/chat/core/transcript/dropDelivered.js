/**
 * Removes the pending messages whose echo has arrived, matched by `tracingId` (the SDK copies
 * the `sendingMessage` tracing id onto the echoed body; sdk-source-notes.md).
 *
 * @param pending - Messages shown as "sending", oldest first. May be empty.
 * @param delivered - Messages just received. May be empty; messages without a `tracingId` never
 *   match anything.
 * @returns `pending` without the entries whose `tracingId` equals some delivered message's
 *   `tracingId`, order kept.
 * @remarks Pure.
 */
export const dropDelivered = (pending, delivered) => {
    const deliveredIds = new Set(delivered.flatMap((message) => (message.tracingId === undefined ? [] : [message.tracingId])));
    return pending.filter((entry) => !deliveredIds.has(entry.tracingId));
};