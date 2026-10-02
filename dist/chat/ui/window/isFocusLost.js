/**
 * Tells whether keyboard focus has left a shadow root's content, so it should be put back.
 *
 * @param root - The shadow root.
 * @returns `true` when `root.activeElement` is null, is inside an element with `hidden`, or is
 *   disabled (`:disabled`, including through a disabled fieldset): a hidden or disabled control
 *   keeps focus until the browser's next rendering update, and then loses it.
 * @remarks Reads the DOM only. Part of `<chat-window>`; tested through it.
 */
export const isFocusLost = (root) => {
    const active = root.activeElement;
    return !active || Boolean(active.closest('[hidden]')) || active.matches(':disabled');
};