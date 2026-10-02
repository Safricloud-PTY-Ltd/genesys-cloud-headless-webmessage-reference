import { toSafeUrl } from "../../core/index.js";
import { renderExternalLink } from "../renderExternalLink.js";
import { renderCardAction } from "./renderCardAction.js";
/**
 * Shows a rich card: image, title, description and buttons.
 *
 * @param card - The card; its URLs are untrusted.
 * @param context - Document and dispatch.
 * @returns An `<article class="card">` with: an `<img alt="">` when `image` passes
 *   `toSafeUrl(image, ['https:'])`; the title in an `<h3>`; the description in a `<p>`; and one
 *   control per action. A `Link` action is an `<a>` to `toSafeUrl(url, ['https:', 'http:'])`
 *   (new tab, `rel="noopener noreferrer"`), left out when unsafe. A `Postback` action is a
 *   `<button type="button">` that dispatches `{ kind: 'postback', postback: { kind: 'card', text,
 *   payload } }`. A safe `defaultAction` link makes the title a link.
 * @remarks Sets no `innerHTML`.
 */
export const renderCard = (card, context) => {
    const { document } = context;
    const article = document.createElement('article');
    article.className = 'card';
    const imageUrl = card.image === undefined ? undefined : toSafeUrl(card.image, ['https:']);
    if (imageUrl !== undefined) {
        const image = document.createElement('img');
        image.setAttribute('src', imageUrl);
        image.setAttribute('alt', '');
        article.append(image);
    }
    const heading = document.createElement('h3');
    const titleUrl = card.defaultAction?.kind === 'Link'
        ? toSafeUrl(card.defaultAction.url, ['https:', 'http:'])
        : undefined;
    heading.append(titleUrl === undefined ? card.title : renderExternalLink(document, titleUrl, [card.title]));
    article.append(heading);
    if (card.description !== undefined) {
        const description = document.createElement('p');
        description.textContent = card.description;
        article.append(description);
    }
    article.append(...card.actions.flatMap((action) => renderCardAction(action, context) ?? []));
    return article;
};