import { makeIconButton } from "../makeIconButton.js";
import { strings } from "../strings.js";
import { makeClearConfirm } from "./makeClearConfirm.js";
/**
 * Creates the header's parts, wired to their actions.
 *
 * @param document - The document to create them with.
 * @param dispatch - Receives the intents the buttons send.
 * @returns A `<header class="header">` (`bar`) holding, in order: `back`
 *   (`makeIconButton('chevronLeft', strings.back)`, class `back`, click → `{ kind: 'showHome' }`),
 *   `logo` (`<img class="logo">`, `alt` = `strings.logoAlt`), `title` (`<h2 class="title">`),
 *   `subtitle` (`<p class="subtitle">`), `clear` (`makeIconButton('delete', strings.clear)`, class
 *   `clear`), `minimise` (`makeIconButton('remove', strings.minimise)`, class `minimise`, click →
 *   `{ kind: 'minimise' }`), and `confirm` from `makeClearConfirm(document, clear, () =>
 *   dispatch({ kind: 'clear' }))`. All empty and unhidden until `drawHeader` runs.
 * @remarks Sets no `innerHTML`. Part of `<chat-header>`; tested through it.
 */
export const makeHeaderParts = (document, dispatch) => {
    const bar = document.createElement('header');
    bar.className = 'header';
    const back = makeIconButton(document, 'chevronLeft', strings.back);
    back.classList.add('back');
    back.addEventListener('click', () => {
        dispatch({ kind: 'showHome' });
    });
    const logo = document.createElement('img');
    logo.className = 'logo';
    logo.alt = strings.logoAlt;
    const title = document.createElement('h2');
    title.className = 'title';
    const subtitle = document.createElement('p');
    subtitle.className = 'subtitle';
    const clear = makeIconButton(document, 'delete', strings.clear);
    clear.classList.add('clear');
    const minimise = makeIconButton(document, 'remove', strings.minimise);
    minimise.classList.add('minimise');
    minimise.addEventListener('click', () => {
        dispatch({ kind: 'minimise' });
    });
    const confirm = makeClearConfirm(document, clear, () => {
        dispatch({ kind: 'clear' });
    });
    bar.append(back, logo, title, subtitle, clear, minimise, confirm);
    return { bar, back, logo, title, subtitle, clear, minimise, confirm };
};