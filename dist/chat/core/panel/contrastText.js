/**
 * Picks the text colour for things drawn on the primary colour (header, launcher, customer
 * bubbles), the way native Messenger does: Material UI's `getContrastText` with a contrast
 * threshold of 4.5, and Genesys' darker black.
 *
 * @param primary - A lower-case `#rrggbb` colour (as `LookAndFeel.primaryColor` holds it).
 * @returns `'#ffffff'` when the WCAG 2 contrast ratio of white against `primary` is 4.5 or more;
 *   otherwise `'rgba(0, 0, 0, 0.93)'`.
 * @remarks Pure. Contrast ratio = (L1 + 0.05) / (L2 + 0.05) with L the WCAG relative luminance
 *   (sRGB channels linearised: c/12.92 when c ≤ 0.03928, else ((c + 0.055)/1.055)^2.4). Ratio
 *   is monotonic in the luminance of `primary`.
 */
export const contrastText = (primary) => {
    const [red = 0, green = 0, blue = 0] = [1, 3, 5].map((start) => {
        const c = Number.parseInt(primary.slice(start, start + 2), 16) / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
    // White has luminance 1, so its contrast against primary is (1 + 0.05) / (L + 0.05).
    return 1.05 / (luminance + 0.05) >= 4.5 ? '#ffffff' : 'rgba(0, 0, 0, 0.93)';
};