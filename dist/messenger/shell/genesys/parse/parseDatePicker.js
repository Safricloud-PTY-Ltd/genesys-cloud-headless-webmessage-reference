import { isRecord, readString } from '#shared';
import { parseDateSlots } from "./parseDateSlots.js";
/**
 * Reads a stand-alone date picker, raw (`content[].datePicker`) or formatted (`datePicker`).
 *
 * @param value - Untrusted: `{ title, subtitle? | description?, imageUrl?, availableTimes }`.
 *   The formatted shape renames `subtitle` to `description`; either is accepted.
 * @returns The picker with `imageUrl` → `image` and slots from `parseDateSlots`, or
 *   `undefined` when `value` is not a record or has no non-empty `title` (the formatted
 *   shape's "no picker" is `{}`). Empty optional strings are omitted.
 * @remarks Pure.
 */
export const parseDatePicker = (value) => {
    if (!isRecord(value))
        return undefined;
    const title = readString(value, 'title');
    if (title === undefined || title === '')
        return undefined;
    const subtitle = readString(value, 'subtitle') ?? readString(value, 'description');
    const image = readString(value, 'imageUrl');
    return {
        title,
        ...(subtitle ? { subtitle } : {}),
        ...(image ? { image } : {}),
        slots: parseDateSlots(value['availableTimes']),
    };
};