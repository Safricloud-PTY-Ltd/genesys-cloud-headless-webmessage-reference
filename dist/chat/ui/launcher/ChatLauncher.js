import { makeIcon } from "../icons/index.js";
import { makeIntentEvent } from "../makeIntentEvent.js";
import { strings } from "../strings.js";
/**
 * `<chat-launcher>`: the round button in the corner that opens and minimises the panel, drawn as
 * native Messenger's launcher (docs/guides/native-messenger-ui.md, "Launcher button"). Renders
 * into its own light DOM inside `<chat-window>`'s shadow root, which styles it. A click leaves as
 * a `chat-intent` event (`makeIntentEvent`) dispatched from this element.
 */
export class ChatLauncher extends HTMLElement {
    #button = document.createElement('button');
    #drawn;
    #open = false;
    /**
     * Draws the launcher for a view. Safe to call on every state change.
     *
     * @param view - What to show.
     * @remarks One `<button type="button" class="launcher">`, created on the first call and kept
     *   (so focus survives), `hidden` while `!view.shown`. Its content and attributes are rebuilt
     *   only when `view` differs (by JSON) from the one last drawn:
     *   - open: class `launcher open`, `makeIcon('expandMore')` only, `aria-expanded="true"`,
     *     `aria-label` and `title` `strings.minimise`;
     *   - closed: class `launcher` plus `text` for `Text` and `IconAndText` displays,
     *     `aria-expanded="false"`; the icon unless the display is `Text`: an `<img alt="">` of
     *     `iconUrl` when set, else `makeIcon('chat')`; then for `Text` and `IconAndText` a
     *     `<span class="launcher-text">` of `view.text`. `aria-label` and `title` are
     *     `strings.launcherOpen` for `Icon`, and `` `${view.text} - ${strings.launcherOpen}` ``
     *     otherwise, as native labels it.
     *   A click dispatches `{ kind: 'minimise' }` when the last view was open, else
     *   `{ kind: 'open' }`.
     */
    update(view) {
        if (this.#drawn === undefined) {
            this.#button.type = 'button';
            this.#button.addEventListener('click', () => {
                this.dispatchEvent(makeIntentEvent({ kind: this.#open ? 'minimise' : 'open' }));
            });
            this.append(this.#button);
        }
        const json = JSON.stringify(view);
        if (json !== this.#drawn) {
            this.#drawn = json;
            this.#open = view.open;
            const key = view.open ? 'open' : view.display;
            const icon = view.iconUrl === undefined
                ? makeIcon(document, 'chat')
                : Object.assign(document.createElement('img'), { src: view.iconUrl, alt: '' });
            const text = Object.assign(document.createElement('span'), {
                className: 'launcher-text',
                textContent: view.text,
            });
            const named = `${view.text} - ${strings.launcherOpen}`;
            const [className, label, content] = {
                open: ['launcher open', strings.minimise, [makeIcon(document, 'expandMore')]],
                Icon: ['launcher', strings.launcherOpen, [icon]],
                Text: ['launcher text', named, [text]],
                IconAndText: ['launcher text', named, [icon, text]],
            }[key];
            this.#button.replaceChildren(...content);
            this.#button.className = className;
            this.#button.setAttribute('aria-expanded', String(view.open));
            this.#button.setAttribute('aria-label', label);
            this.#button.title = label;
        }
        this.#button.hidden = !view.shown;
    }
    /**
     * Puts keyboard focus on the launcher button, as native does when the panel closes.
     *
     * @remarks Does nothing before the first `update`, or while the button is hidden.
     */
    focusButton() {
        if (this.#drawn !== undefined && !this.#button.hidden) {
            this.#button.focus();
        }
    }
}