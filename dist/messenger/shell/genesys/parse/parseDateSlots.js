import { isRecord, readNumber, readString } from '#shared';
/**
 * Reads a picker's `availableTimes` (same in both message shapes).
 *
 * @param value - Untrusted: an array of `{ dateTime, duration }`, `duration` in seconds.
 * @returns One slot per item whose `dateTime` is a string `Date.parse` can read, with
 *   `durationSeconds` from `duration` when it is a non-negative number (a numeric string such as
 *   `"1700"` is read too), else 0; sorted by instant, earliest first, ties in input order.
 *   Empty for anything that isn't an array.
 * @remarks Pure. Never mutates `value` (the SDK sorts its own copy in place).
 */
export const parseDateSlots = (value) => {
    if (!Array.isArray(value))
        return [];
    return value
        .filter(isRecord)
        .flatMap((item) => {
        const dateTime = readString(item, 'dateTime');
        const at = Date.parse(dateTime ?? '');
        if (dateTime === undefined || Number.isNaN(at))
            return [];
        const duration = readNumber(item, 'duration') ?? Number(readString(item, 'duration'));
        const durationSeconds = Number.isFinite(duration) && duration >= 0 ? duration : 0;
        return [{ at, slot: { dateTime, durationSeconds } }];
    })
        .toSorted((a, b) => a.at - b.at)
        .map((entry) => entry.slot);
};