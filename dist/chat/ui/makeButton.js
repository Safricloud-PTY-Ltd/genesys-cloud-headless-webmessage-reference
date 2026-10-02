/**
 * Builds a plain action button.
 *
 * @param document - The document to create it with.
 * @param label - Its visible text, which is also its accessible name.
 * @param onClick - Called on every click.
 * @returns A `<button type="button">` showing `label`, with `onClick` attached.
 * @remarks Sets no `innerHTML`. Tested through the elements that use it.
 */
export const makeButton = (document, label, onClick) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', onClick);
    return button;
};