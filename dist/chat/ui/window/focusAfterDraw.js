/**
 * Decides where keyboard focus goes after the panel opens, closes or changes screen, so a
 * keyboard user is never dropped to the top of the page, and focus is never taken from the page
 * when nothing the customer did asked for it (a panel restored on reload).
 *
 * @param before - The panel before the event.
 * @param after - The panel after it.
 * @param cause - Why the redraw happened.
 * @param cause.focus - Where focus was before the redraw.
 * @param cause.trigger - The kind of event that caused the redraw; `undefined` for the first draw.
 * @returns `after.view` when the panel went from closed to open on a `panelOpened` (the launcher,
 *   the page's own button, or `open()`: native focuses the message field, or the home card's
 *   button), whatever `cause.focus` was; `launcher` when it went from open to closed while focus was
 *   in the panel (native gives focus back to the launcher); `after.view` when it stayed open, its
 *   view changed, and focus was in the panel; otherwise `undefined` (leave focus alone, as after
 *   a `panelRestored`).
 * @remarks Pure.
 */
export const focusAfterDraw = (before, after, cause) => {
    const { focus, trigger } = cause;
    if (!before.open && after.open) {
        return trigger === 'panelOpened' ? after.view : undefined;
    }
    if (focus !== 'panel' || !before.open) {
        return undefined;
    }
    if (!after.open) {
        return 'launcher';
    }
    return before.view === after.view ? undefined : after.view;
};