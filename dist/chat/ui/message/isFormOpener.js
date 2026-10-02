/**
 * Tells whether an element can open a form, so the message renderer can drive `<chat-form>`
 * without importing its class (any element with an `open` method qualifies).
 *
 * @param element - Usually a freshly created `<chat-form>`.
 * @returns `true` when `element.open` is a function.
 * @remarks Part of `renderFormLauncher`; tested through it.
 */
export const isFormOpener = (element) => {
    return typeof Reflect.get(element, 'open') === 'function';
};