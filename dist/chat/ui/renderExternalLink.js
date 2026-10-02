import { strings } from "./strings.js";
/**
 * Builds a link that opens outside the chat, the one way every chat element makes one.
 *
 * @param document - The document to create elements with.
 * @param href - An already-checked URL (from `toSafeUrl`); used as is.
 * @param content - What the link shows: text or nodes, in order. May be empty.
 * @returns An `<a href target="_blank" rel="noopener noreferrer">` holding the content, then a
 *   `<span class="visually-hidden">` with " " + `strings.opensInNewTab`, so screen-reader users
 *   know where it goes.
 * @remarks Sets no `innerHTML`.
 */
export const renderExternalLink = (document, href, content) => {
    const link = document.createElement('a');
    link.setAttribute('href', href);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    link.append(...content);
    const hint = document.createElement('span');
    hint.className = 'visually-hidden';
    hint.textContent = ` ${strings.opensInNewTab}`;
    link.append(hint);
    return link;
};