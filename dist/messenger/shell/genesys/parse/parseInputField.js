import { readBoolean, readString } from '#shared';
/**
 * Builds an `Input` field: `title` defaults to `""`, `subtitle` and `placeholderText` → `placeholder` omitted when empty, `required`/`multiline` from `isRequired`/`isMultipleLine`, `true` only for boolean `true`.
 *
 * @param component - The component's `Input`-specific record (`input`, `datePicker`, ...).
 * @param id - Its id, already checked non-empty.
 * @returns The field.
 * @remarks Pure. Part of `parseFormField`; tested through it.
 */
export const parseInputField = (component, id) => {
    const subtitle = readString(component, 'subtitle');
    const placeholder = readString(component, 'placeholderText');
    return {
        kind: 'Input',
        id,
        title: readString(component, 'title') ?? '',
        ...(subtitle === undefined || subtitle === '' ? {} : { subtitle }),
        ...(placeholder === undefined || placeholder === '' ? {} : { placeholder }),
        required: readBoolean(component, 'isRequired') === true,
        multiline: readBoolean(component, 'isMultipleLine') === true,
    };
};