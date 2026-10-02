import { readString } from '#shared';
import { parseListSections } from "./parseListSections.js";
/**
 * Builds a `ListPicker` field: `title` defaults to `""`, sections from `parseListSections(component.sections)`.
 *
 * @param component - The component's `ListPicker`-specific record (`input`, `datePicker`, ...).
 * @param id - Its id, already checked non-empty.
 * @returns The field.
 * @remarks Pure. Part of `parseFormField`; tested through it.
 */
export const parseListField = (component, id) => {
    return {
        kind: 'ListPicker',
        id,
        title: readString(component, 'title') ?? '',
        sections: parseListSections(component['sections']),
    };
};