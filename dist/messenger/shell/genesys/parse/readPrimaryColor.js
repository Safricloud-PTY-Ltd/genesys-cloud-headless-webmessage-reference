import { readRecord, readString } from '#shared';
import { nativeLookAndFeel } from "../../../types.js";
/**
 * Reads `messenger.styles.primaryColor`.
 *
 * @param config - The deployment config record.
 * @returns The colour as lower-case `#rrggbb`: a `#rrggbb` value as is, lower-cased; a `#rgb`
 *   value expanded (`#A0c` → `#aa00cc`). `nativeLookAndFeel.primaryColor` when the field is
 *   missing, not a string, or not one of those two forms (surrounding whitespace is trimmed first).
 * @remarks Pure. Part of `parseLookAndFeel`; tested through it. Only hex is accepted because the
 *   colour is also used to compute a contrasting text colour.
 */
export const readPrimaryColor = (config) => {
    const styles = readRecord(readRecord(config, 'messenger') ?? {}, 'styles') ?? {};
    const value = (readString(styles, 'primaryColor') ?? '').trim().toLowerCase();
    if (/^#[0-9a-f]{6}$/.test(value)) {
        return value;
    }
    if (/^#[0-9a-f]{3}$/.test(value)) {
        return value.replace(/[0-9a-f]/g, '$&$&');
    }
    return nativeLookAndFeel.primaryColor;
};