import { readString } from '#shared';
const displayFormats = [
    'dayMonthYear',
    'monthDayYear',
    'yearMonthDay',
];
/**
 * Builds a `DatePicker` field: `title` defaults to `""`, `subtitle` omitted when empty, `min`/`max` the first 10 characters of `dateMinimum`/`dateMaximum` when each is a string of at least 10 characters, `displayFormat` from `dateDisplayFormat` when one of the three known values, else `monthDayYear`.
 *
 * @param component - The component's `DatePicker`-specific record (`input`, `datePicker`, ...).
 * @param id - Its id, already checked non-empty.
 * @returns The field.
 * @remarks Pure. Part of `parseFormField`; tested through it.
 */
export const parseDateField = (component, id) => {
    const subtitle = readString(component, 'subtitle');
    const [min, max] = [
        readString(component, 'dateMinimum'),
        readString(component, 'dateMaximum'),
    ].map((date) => (date === undefined || date.length < 10 ? undefined : date.slice(0, 10)));
    const format = readString(component, 'dateDisplayFormat');
    return {
        kind: 'DatePicker',
        id,
        title: readString(component, 'title') ?? '',
        ...(subtitle === undefined || subtitle === '' ? {} : { subtitle }),
        ...(min === undefined ? {} : { min }),
        ...(max === undefined ? {} : { max }),
        displayFormat: displayFormats.find((known) => known === format) ?? 'monthDayYear',
    };
};