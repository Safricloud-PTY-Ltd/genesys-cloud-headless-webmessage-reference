import { makeIntentEvent } from "../makeIntentEvent.js";
import { drawHeader } from "./drawHeader.js";
import { makeHeaderParts } from "./makeHeaderParts.js";
/**
 * `<chat-header>`: the coloured bar at the top of the panel, with native Messenger's title and
 * icon buttons, and the Clear confirmation. Renders into its own light DOM inside `<chat-window>`'s
 * shadow root, which styles it. Actions leave as `chat-intent` events (`makeIntentEvent`)
 * dispatched from this element.
 */
export class ChatHeader extends HTMLElement {
    #parts = undefined;
    /**
     * Draws the header for a view. Safe to call on every state change.
     *
     * @param view - What to show.
     * @remarks Creates its parts on the first call and keeps them (so focus survives); afterwards
     *   only text, `src` and `hidden` change. Parts, in order, inside a `<header class="header">`
     *   with class `home` added while `view.view` is `home`:
     *   - Back: `makeIconButton('chevronLeft', strings.back)`, class `back`, shown when
     *     `canGoBack`; click → `{ kind: 'showHome' }`.
     *   - Logo: `<img class="logo" alt>` (`strings.logoAlt`), shown when `logoUrl` is set.
     *   - Title: `<h2 class="title">` of `title`; subtitle `<p class="subtitle">` of `subtitle`,
     *     hidden when absent.
     *   - Clear: `makeIconButton('delete', strings.clear)`, class `clear`, shown when `canClear`;
     *     click opens the confirmation.
     *   - Minimise: `makeIconButton('remove', strings.minimise)`, class `minimise`, with the
     *     attribute `data-always` present only when `minimiseAlways` (the stylesheet shows it then,
     *     or on a narrow screen); click → `{ kind: 'minimise' }`.
     *   - Confirmation: a `<div class="confirm" role="alertdialog" aria-modal="true">` labelled by
     *     its `<p>` of `strings.clearConfirm` (`aria-labelledby`, an id unique in the shadow root),
     *     hidden until the bin is clicked, holding a `strings.clearYes` button (class `primary`;
     *     focuses the bin, hides the confirmation and dispatches `{ kind: 'clear' }`, so focus stays
     *     in the panel until the clear lands) and a `strings.cancel` button (hides it and puts focus
     *     back on the bin, as native does). Opening it focuses the Cancel button, the choice that
     *     loses nothing. While open it is modal for the keyboard (`wireConfirmKeys`): Escape takes
     *     the Cancel path, and Tab / Shift+Tab cycle between its two buttons. A redraw where
     *     `canClear` became false (the panel minimised, the messages gone, Clear disabled) hides it.
     */
    update(view) {
        if (this.#parts === undefined) {
            this.#parts = makeHeaderParts(this.ownerDocument, (intent) => {
                this.dispatchEvent(makeIntentEvent(intent));
            });
            this.append(this.#parts.bar);
        }
        drawHeader(this.#parts, view);
    }
}