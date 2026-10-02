/**
 * Decides which side of the viewport the launcher and panel sit on.
 *
 * @param alignment - The deployment's `position.alignment`.
 * @param direction - The page's text direction.
 * @returns `Left` → `left`; `Right` → `right`; `Auto` → `left` for `rtl`, `right` for `ltr`.
 * @remarks Pure.
 */
export const resolveSide = (alignment, direction) => {
    if (alignment === 'Left') {
        return 'left';
    }
    if (alignment === 'Right') {
        return 'right';
    }
    return direction === 'rtl' ? 'left' : 'right';
};