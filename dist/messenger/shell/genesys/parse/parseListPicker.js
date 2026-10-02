import { isRecord } from '#shared';
import { parseListSections } from "./parseListSections.js";
import { parsePromptText } from "./parsePromptText.js";
/**
 * Reads a list picker, raw (`content[].listPicker`) or formatted (`listPicker`); the formatted
 * one is the raw object plus an `id`.
 *
 * @param value - Untrusted: `{ sections, receivedMessage?, replyMessage? }`.
 * @returns The picker: prompt text from `parsePromptText(value, 'subtitle')` and sections from
 *   `parseListSections`; or `undefined` when `value` is not a record or no section survives.
 * @remarks Pure.
 */
export const parseListPicker = (value) => {
    if (!isRecord(value))
        return undefined;
    const sections = parseListSections(value['sections']);
    if (sections.length === 0)
        return undefined;
    return { ...parsePromptText(value, 'subtitle'), sections };
};