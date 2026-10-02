import { err, isRecord, ok, readNumber, readRecord } from '#shared';
import { invalidPayload } from "../../../types.js";
import { toEpochMs } from "./toEpochMs.js";
/**
 * Parses a session-timing or typing event.
 *
 * @param name - Which event.
 * @param data - The envelope's `data`, untrusted.
 * @returns `sessionTimingUpdated` with `expiresAt` = `toEpochMs(expirationDate)`;
 *   `sessionWarning` with `expiresAt` = `toEpochMs(expirationTime)`; `typingReceived` with
 *   `durationMs` from `typing.duration`, else `typing.durationMs`, else 5000.
 * @errors InvalidPayload (source `name`) - when `data` is not a record, or the expiry field is
 *   not a positive number.
 * @remarks Pure.
 */
export const parseSessionEvent = (name, data) => {
    if (!isRecord(data))
        return err(invalidPayload(name, 'data is not a record'));
    if (name === 'typingReceived') {
        const typing = readRecord(data, 'typing') ?? {};
        const durationMs = readNumber(typing, 'duration') ?? readNumber(typing, 'durationMs') ?? 5000;
        return ok({ kind: 'typingReceived', durationMs });
    }
    const field = { sessionTimingUpdated: 'expirationDate', sessionWarning: 'expirationTime' }[name];
    const expiry = readNumber(data, field);
    if (expiry === undefined || expiry <= 0) {
        return err(invalidPayload(name, `${field} is not a positive number`));
    }
    return ok({ kind: name, expiresAt: toEpochMs(expiry) });
};