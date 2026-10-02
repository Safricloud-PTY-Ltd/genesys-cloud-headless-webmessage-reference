/**
 * Tells whether a calendar date falls within a form date field's allowed range.
 *
 * @param date - `YYYY-MM-DD`.
 * @param min - The earliest allowed date, `YYYY-MM-DD`; `undefined` for no lower bound.
 * @param max - The latest allowed date, `YYYY-MM-DD`; `undefined` for no upper bound.
 * @returns `true` when `date` is not before `min` and not after `max`. Both bounds are inclusive.
 * @remarks Pure. `YYYY-MM-DD` strings sort as dates, so they compare as strings. Part of
 *   `missingFields`; tested through it.
 */
export const isDateInRange = (date, min, max) => {
    return (min === undefined || date >= min) && (max === undefined || date <= max);
};