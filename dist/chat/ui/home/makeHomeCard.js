import { makeButton } from "../makeButton.js";
import { strings } from "../strings.js";
/**
 * Builds the home screen's conversation card for a view.
 *
 * @param view - What to show.
 * @param context - Document, dispatch and time formatting.
 * @returns The `<section class="home-card">` that `<chat-home>`'s `update` describes: the `<h3>`
 *   by card, the optional `p.preview` with its `<time>`, the primary button and, for `ended`,
 *   Start new, with the same dispatches.
 * @remarks Sets no `innerHTML`. Part of `<chat-home>`; tested through it.
 */
export const makeHomeCard = (view, context) => {
    const { document, dispatch } = context;
    const [heading, label] = {
        start: [strings.homeStartTitle, strings.homeStart],
        continue: [strings.homeContinueTitle, strings.homeContinue],
        ended: [strings.homeEndedTitle, strings.homeOpen],
    }[view.card];
    const card = Object.assign(document.createElement('section'), { className: 'home-card' });
    card.append(Object.assign(document.createElement('h3'), { textContent: heading }));
    if (view.preview !== undefined) {
        const preview = Object.assign(document.createElement('p'), { className: 'preview' });
        const time = Object.assign(document.createElement('time'), {
            textContent: context.formatTime(view.preview.time),
        });
        preview.append(view.preview.text === '' ? strings.attachment : view.preview.text, ' ', time);
        card.append(preview);
    }
    const primary = makeButton(document, label, () => {
        dispatch({ kind: 'showConversation' });
    });
    primary.classList.add('primary');
    card.append(primary);
    if (view.card === 'ended') {
        card.append(makeButton(document, strings.startNew, () => {
            dispatch({ kind: 'reset' });
            dispatch({ kind: 'showConversation' });
        }));
    }
    return card;
};