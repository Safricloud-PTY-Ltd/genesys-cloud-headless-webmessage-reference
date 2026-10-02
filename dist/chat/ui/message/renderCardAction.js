import { toSafeUrl } from "../../core/index.js";
import { renderExternalLink } from "../renderExternalLink.js";
/**
 * Builds one button of a card.
 *
 * @param action - The card action.
 * @param context - Document and dispatch.
 * @returns A `Link` action as `renderExternalLink` to `toSafeUrl(url, ['https:', 'http:'])`, or
 *   `undefined` when that rejects the URL; a `Postback` action as a `<button type="button">` with its
 *   text that dispatches `{ kind: 'postback', postback: { kind: 'card', text, payload } }`.
 * @remarks Sets no `innerHTML`. Part of `renderCard`; tested through it.
 */
export const renderCardAction = (action, context) => {
    if (action.kind === 'Link') {
        const href = toSafeUrl(action.url, ['https:', 'http:']);
        return href === undefined
            ? undefined
            : renderExternalLink(context.document, href, [action.text]);
    }
    const button = context.document.createElement('button');
    button.setAttribute('type', 'button');
    button.textContent = action.text;
    button.addEventListener('click', () => {
        context.dispatch({
            kind: 'postback',
            postback: { kind: 'card', text: action.text, payload: action.payload },
        });
    });
    return button;
};