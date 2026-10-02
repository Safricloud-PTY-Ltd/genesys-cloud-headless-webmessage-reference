/**
 * Makes the Clear confirmation modal for the keyboard, as native's dialog is.
 *
 * @param confirm - The confirmation element.
 * @param yes - Its first button.
 * @param cancel - Its second button.
 * @remarks Adds one `keydown` listener on `confirm` that acts only while `confirm` is not
 *   `hidden`: Escape clicks `cancel` (the Cancel path); Tab and Shift+Tab call
 *   `preventDefault` and focus whichever of `yes` and `cancel` is not the event's target. Other
 *   keys pass. Part of `<chat-header>`; tested through it.
 */
export const wireConfirmKeys = (confirm, yes, cancel) => {
    confirm.addEventListener('keydown', (event) => {
        if (confirm.hidden)
            return;
        if (event.key === 'Escape') {
            cancel.click();
        }
        else if (event.key === 'Tab') {
            event.preventDefault();
            (event.target === yes ? cancel : yes).focus();
        }
    });
};