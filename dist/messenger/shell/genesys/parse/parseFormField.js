import { isRecord, readRecord, readString } from '#shared';
import { parseDateField } from "./parseDateField.js";
import { parseInputField } from "./parseInputField.js";
import { parseListField } from "./parseListField.js";
import { parseWheelField } from "./parseWheelField.js";
// Each `formComponentType` carries its details under its own property name.
const fieldKinds = {
    Input: ['input', parseInputField],
    DatePicker: ['datePicker', parseDateField],
    ListPicker: ['listPicker', parseListField],
    WheelPicker: ['wheelPicker', parseWheelField],
};
/**
 * Reads one form page component (`ConversationFormPageComponent`) by `formComponentType`.
 *
 * @param value - Untrusted: `{ formComponentType: 'Input' | 'DatePicker' | 'ListPicker' |
 *   'WheelPicker', input | datePicker | listPicker | wheelPicker }`.
 * @returns The field, or `undefined` when the type is unknown, the matching property is missing,
 *   or it has no non-empty `id`. `title` is `""` when absent. Input: `placeholderText` →
 *   `placeholder`, `isRequired` → `required`, `isMultipleLine` → `multiline` (both `true`
 *   only for boolean `true`). DatePicker: `min`/`max` are the first 10 characters of
 *   `dateMinimum`/`dateMaximum` when those are strings of at least 10 characters;
 *   `displayFormat` is `dateDisplayFormat` when it is one of the three known values, else
 *   `monthDayYear`. ListPicker: sections via `parseListSections`. WheelPicker: items with a
 *   non-empty `id`, `title` falling back to `value` then `id`.
 * @remarks Pure. Empty optional strings are omitted.
 */
export const parseFormField = (value) => {
    if (!isRecord(value))
        return undefined;
    const type = readString(value, 'formComponentType');
    const kind = Object.entries(fieldKinds).find(([name]) => name === type)?.[1];
    if (kind === undefined)
        return undefined;
    const [property, build] = kind;
    const component = readRecord(value, property);
    const id = component === undefined ? undefined : readString(component, 'id');
    return component === undefined || id === undefined || id === ''
        ? undefined
        : build(component, id);
};