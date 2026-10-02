import { err, isRecord, ok, readArray } from '#shared';
import { invalidPayload } from "../../../types.js";
/**
 * Reads a list of messages from an event payload, keeping the ones that parse.
 *
 * @param data - The event's `data`, untrusted.
 * @param key - The field holding the list: `messages`, or `updatedMessages` for `messagesUpdated`.
 * @param parse - `parseRawMessage` or `parseFormattedMessage`, depending on the event.
 * @returns The parsed messages in payload order. Items `parse` rejects are left out: one
 *   unrenderable message (a receipt, a typing event) must not hide the rest.
 * @errors InvalidPayload (source `messages`) - when `data` is not a record or `data[key]` is not
 *   an array.
 * @remarks Pure.
 */
export const parseMessageList = (data, key, parse) => {
    if (!isRecord(data) || !Array.isArray(data[key])) {
        return err(invalidPayload('messages', `${key} is not a list`));
    }
    return ok(readArray(data, key)
        .map(parse)
        .flatMap((parsed) => (parsed.ok ? [parsed.value] : [])));
};