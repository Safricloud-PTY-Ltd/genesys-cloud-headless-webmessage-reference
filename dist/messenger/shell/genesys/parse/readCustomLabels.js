import { isRecord, readArray, readString } from '#shared';
// A Map, not an object literal, so a configured key such as `constructor` matches nothing.
const labelFields = new Map([
    ['MessengerHomeHeaderTitle', 'homeTitle'],
    ['MessengerHomeHeaderSubTitle', 'homeSubtitle'],
    ['MessengerLauncherButtonText', 'launcherText'],
]);
/**
 * Reads `customI18nLabels`: the text an admin overrode, per language.
 *
 * @param config - The deployment config record.
 * @returns One entry per element of `customI18nLabels` whose `language` is a non-blank string,
 *   in order, with `language` trimmed and lower-cased. From its `localizedLabels` array, each
 *   `{ key, value }` whose `value` is a non-blank string sets: `MessengerHomeHeaderTitle` →
 *   `homeTitle`, `MessengerHomeHeaderSubTitle` → `homeSubtitle`, `MessengerLauncherButtonText`
 *   → `launcherText` (values kept as given). Other keys and malformed items are skipped; a key
 *   given twice keeps the last. `[]` when the field is missing or not an array.
 * @remarks Pure. Part of `parseLookAndFeel`; tested through it.
 */
export const readCustomLabels = (config) => {
    return readArray(config, 'customI18nLabels')
        .filter(isRecord)
        .map((entry) => ({
        language: (readString(entry, 'language') ?? '').trim().toLowerCase(),
        localized: readArray(entry, 'localizedLabels').filter(isRecord),
    }))
        .filter(({ language }) => language !== '')
        .map(({ language, localized }) => localized.reduce((labels, item) => {
        const field = labelFields.get(readString(item, 'key') ?? '');
        const value = readString(item, 'value') ?? '';
        return field === undefined || value.trim() === ''
            ? labels
            : { ...labels, [field]: value };
    }, { language }));
};