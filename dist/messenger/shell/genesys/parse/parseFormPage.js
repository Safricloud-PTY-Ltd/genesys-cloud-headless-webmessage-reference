import { isRecord, readArray, readString } from '#shared';
import { parseFormField } from "./parseFormField.js";
/**
 * Reads one page of a form (`formPages[]`).
 *
 * @param value - Untrusted: `{ title, subtitle?, pageComponents }`.
 * @returns The page: `title` (`""` when absent), `subtitle` when non-empty, and its
 *   `pageComponents` through `parseFormField` with unknown ones dropped; `undefined` when `value`
 *   is not a record or no field survives.
 * @remarks Pure. Part of `parseForm`; tested through it.
 */
export const parseFormPage = (value) => {
    if (!isRecord(value))
        return undefined;
    const subtitle = readString(value, 'subtitle');
    const fields = readArray(value, 'pageComponents')
        .map(parseFormField)
        .filter((field) => field !== undefined);
    return fields.length === 0
        ? undefined
        : {
            title: readString(value, 'title') ?? '',
            ...(subtitle ? { subtitle } : {}),
            fields,
        };
};