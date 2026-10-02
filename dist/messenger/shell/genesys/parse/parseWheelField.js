import { isRecord, readArray, readString } from '#shared';
/**
 * Builds a `WheelPicker` field: `title` defaults to `""`; items with a non-empty `id` only, each `title` falling back to a non-empty `value`, then to the `id`.
 *
 * @param component - The component's `WheelPicker`-specific record (`input`, `datePicker`, ...).
 * @param id - Its id, already checked non-empty.
 * @returns The field.
 * @remarks Pure. Part of `parseFormField`; tested through it.
 */
export const parseWheelField = (component, id) => {
    return {
        kind: 'WheelPicker',
        id,
        title: readString(component, 'title') ?? '',
        items: readArray(component, 'items')
            .filter(isRecord)
            .flatMap((item) => {
            const itemId = readString(item, 'id');
            if (itemId === undefined || itemId === '')
                return [];
            const title = [readString(item, 'title'), readString(item, 'value')].find((candidate) => candidate !== undefined && candidate !== '');
            return [{ id: itemId, title: title ?? itemId }];
        }),
    };
};