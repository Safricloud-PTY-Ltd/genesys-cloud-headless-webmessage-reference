import { isRecord, readString } from '#shared';
/**
 * Reads a form's introduction (`form.introduction`).
 *
 * @param value - Untrusted: `{ title, subtitle?, imageUrl?, buttonText? }`.
 * @returns The introduction: `title`, `subtitle` and `imageUrl` → `image` when non-empty, and
 *   `buttonText` (`"Start"` when absent or empty, so the button always has a name); `undefined` when `value` is not a record or `title` is
 *   missing or empty.
 * @remarks Pure. Part of `parseForm`; tested through it.
 */
export const parseFormIntroduction = (value) => {
    if (!isRecord(value))
        return undefined;
    const title = readString(value, 'title');
    const subtitle = readString(value, 'subtitle');
    const image = readString(value, 'imageUrl');
    return title
        ? {
            title,
            ...(subtitle ? { subtitle } : {}),
            ...(image ? { image } : {}),
            buttonText: [readString(value, 'buttonText')].find(Boolean) ?? 'Start',
        }
        : undefined;
};