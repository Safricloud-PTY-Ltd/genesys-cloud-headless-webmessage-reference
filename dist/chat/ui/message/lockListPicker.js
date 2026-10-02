/**
 * Locks a list picker once its answer has been sent.
 *
 * @param fieldsets - The picker's sections; each is disabled, which disables its inputs.
 * @param button - The Send button; marked `aria-disabled="true"`, not `disabled`, so it keeps
 *   keyboard focus.
 * @remarks Mutates the elements it is given, which the caller just created. Part of
 *   `renderListPicker`; tested through it.
 */
export const lockListPicker = (fieldsets, button) => {
    fieldsets.forEach((fieldset) => {
        fieldset.disabled = true;
    });
    button.setAttribute('aria-disabled', 'true');
};