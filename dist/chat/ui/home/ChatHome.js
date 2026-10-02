import { makeHomeCard } from "./makeHomeCard.js";
/**
 * `<chat-home>`: native Messenger's home screen body, the card that starts, continues or reopens
 * the conversation (the header above it is `<chat-header>`). Renders into its own light DOM
 * inside `<chat-window>`'s shadow root, which styles it. Buttons leave as `chat-intent` events
 * through `context.dispatch`.
 */
export class ChatHome extends HTMLElement {
    #drawn;
    /**
     * Draws the card for a view. Safe to call on every state change.
     *
     * @param view - What to show.
     * @param context - Document, dispatch and time formatting.
     * @remarks Rebuilds only when `view` differs (by JSON) from the one last drawn, so a redraw
     *   never steals focus. A `<section class="home-card">` holding: an `<h3>` of
     *   `strings.homeStartTitle`, `strings.homeContinueTitle` or `strings.homeEndedTitle` by `card`;
     *   when `preview` is set, a `<p class="preview">` with its text (`strings.attachment` when the
     *   text is empty) and a `<time>` of `context.formatTime(preview.time)`; a primary button
     *   (class `primary`) reading `strings.homeStart`, `strings.homeContinue` or `strings.homeOpen`
     *   that dispatches `{ kind: 'showConversation' }`; and for `ended` a second button,
     *   `strings.startNew`, that dispatches `{ kind: 'reset' }` then `{ kind: 'showConversation' }`.
     *   When focus was inside this element before a rebuild, it moves to the new card's primary
     *   button (`focusControl`), so a message arriving while a card button has focus doesn't drop
     *   the keyboard user to the page.
     */
    update(view, context) {
        const json = JSON.stringify(view);
        if (json === this.#drawn) {
            return;
        }
        this.#drawn = json;
        // Read before replacing: removing the focused button drops focus to the page.
        const root = this.getRootNode();
        const hadFocus = this.contains(root.activeElement);
        this.replaceChildren(makeHomeCard(view, context));
        if (hadFocus)
            this.focusControl();
    }
    /**
     * Puts keyboard focus on the card's primary button, as native's home card autofocuses it.
     *
     * @remarks Does nothing before the first `update`.
     */
    focusControl() {
        this.querySelector('section.home-card button.primary')?.focus();
    }
}