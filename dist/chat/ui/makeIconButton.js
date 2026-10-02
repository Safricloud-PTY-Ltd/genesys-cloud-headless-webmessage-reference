import { makeIcon } from "./icons/index.js";
/**
 * Builds a button that shows only an icon, as native Messenger's header and composer buttons do.
 *
 * @param document - The document to create it with.
 * @param icon - The icon to show (`makeIcon`).
 * @param label - Its accessible name, also shown as a tooltip.
 * @returns A `<button type="button" class="icon-button">` with `aria-label` and `title` both
 *   `label`, holding `makeIcon(document, icon)` and nothing else. No click handler: the caller
 *   adds one.
 * @remarks Sets no `innerHTML`.
 */
export const makeIconButton = (document, icon, label) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'icon-button';
    button.setAttribute('aria-label', label);
    button.title = label;
    button.append(makeIcon(document, icon));
    return button;
};