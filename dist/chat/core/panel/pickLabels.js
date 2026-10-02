/**
 * Chooses the admin's custom labels for the page's language.
 *
 * @param labels - From `LookAndFeel.labels`; languages lower-case. May be empty.
 * @param language - The page's language tag (`document.documentElement.lang`), any case. May be
 *   empty.
 * @returns The first entry whose `language` equals `language` lower-cased; else the first whose
 *   primary subtag (before `-`) equals `language`'s; else the first `en-us` entry; else
 *   `undefined`.
 * @remarks Pure.
 */
export const pickLabels = (labels, language) => {
    const wanted = language.toLowerCase();
    const primary = wanted.split('-')[0];
    return (labels.find((entry) => entry.language === wanted) ??
        labels.find((entry) => entry.language.split('-')[0] === primary) ??
        labels.find((entry) => entry.language === 'en-us'));
};