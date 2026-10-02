import { readNumber, readRecord, readString } from '#shared';
import { nativeLookAndFeel } from "../../../types.js";
// A Map, not an object literal, so a configured value such as `constructor` matches nothing.
const alignments = new Map([
    ['auto', 'Auto'],
    ['left', 'Left'],
    ['right', 'Right'],
]);
/**
 * Reads `position`: which side, and how far from the viewport edges.
 *
 * @param config - The deployment config record.
 * @returns `alignment`: `position.alignment` matched case-insensitively against `auto`, `left`
 *   and `right` (the API sends `Auto`/`Left`/`Right`; native lower-cases it), else `Auto`.
 *   `sideSpace` and `bottomSpace`: `position.sideSpace` / `position.bottomSpace` when a finite
 *   number of 0 or more (0 is honoured, as native does), else 20 and 12.
 * @remarks Pure. Part of `parseLookAndFeel`; tested through it.
 */
export const readPosition = (config) => {
    const position = readRecord(config, 'position') ?? {};
    const alignment = (readString(position, 'alignment') ?? '').toLowerCase();
    const sideSpace = readNumber(position, 'sideSpace');
    const bottomSpace = readNumber(position, 'bottomSpace');
    return {
        alignment: alignments.get(alignment) ?? nativeLookAndFeel.alignment,
        sideSpace: sideSpace !== undefined && sideSpace >= 0 ? sideSpace : nativeLookAndFeel.sideSpace,
        bottomSpace: bottomSpace !== undefined && bottomSpace >= 0 ? bottomSpace : nativeLookAndFeel.bottomSpace,
    };
};