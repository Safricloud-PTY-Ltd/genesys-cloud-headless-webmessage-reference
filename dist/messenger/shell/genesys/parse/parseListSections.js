import { isRecord, readArray, readBoolean, readString } from '#shared';
/**
 * Reads a list picker's `sections` (same in both shapes, and inside forms).
 *
 * @param value - Untrusted: `[{ title, multipleSelection, items: [{ id, title, subtitle?,
 *   imageUrl? }] }]`.
 * @returns Sections in order. Items without a non-empty `id` and `title` are dropped, and so
 *   are sections left with no items. A missing `title` is `""`; `multipleSelection` is `true`
 *   only when it is the boolean `true`; `imageUrl` → `image`. Empty for anything that isn't an
 *   array.
 * @remarks Pure.
 */
export const parseListSections = (value) => {
    if (!Array.isArray(value))
        return [];
    return value
        .filter(isRecord)
        .map((section) => ({
        title: readString(section, 'title') ?? '',
        multipleSelection: readBoolean(section, 'multipleSelection') === true,
        items: readArray(section, 'items')
            .filter(isRecord)
            .flatMap((item) => {
            const id = readString(item, 'id');
            const title = readString(item, 'title');
            if (id === undefined || id === '' || title === undefined || title === '')
                return [];
            const subtitle = readString(item, 'subtitle');
            const image = readString(item, 'imageUrl');
            return [
                {
                    id,
                    title,
                    ...(subtitle === undefined ? {} : { subtitle }),
                    ...(image === undefined ? {} : { image }),
                },
            ];
        }),
    }))
        .filter((section) => section.items.length > 0);
};