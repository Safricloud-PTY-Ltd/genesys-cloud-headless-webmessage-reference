/**
 * Writes a date the way a form's `dateDisplayFormat` asks, for the answer's `text`.
 *
 * @param date - `YYYY-MM-DD`.
 * @param format - `dayMonthYear` → `DD/MM/YYYY`, `monthDayYear` → `MM/DD/YYYY`,
 *   `yearMonthDay` → `YYYY/MM/DD`.
 * @returns The date with its parts reordered and joined by `/`; `date` unchanged when it doesn't
 *   have the `YYYY-MM-DD` shape.
 * @remarks Pure. No calendar check: it reorders text.
 */
export const formatFormDate = (date, format) => {
    const order = {
        dayMonthYear: '$3/$2/$1',
        monthDayYear: '$2/$3/$1',
        yearMonthDay: '$1/$2/$3',
    };
    // A string without the YYYY-MM-DD shape doesn't match, and replace returns it unchanged.
    return date.replace(/^(\d{4})-(\d{2})-(\d{2})$/, order[format]);
};