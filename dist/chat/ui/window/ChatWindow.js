import { nativeLookAndFeel } from '#messenger';
import { autoStartDue, contrastText, initialConversation, isAnswered, launcherShown, reduceConversation, resolveSide, returnedDraft, } from "../../core/index.js";
import { headerView } from "../header/index.js";
import { homeView } from "../home/index.js";
import { launcherView } from "../launcher/index.js";
import { makeIntentEvent } from "../makeIntentEvent.js";
import { strings } from "../strings.js";
import { chatStyles } from "./chatStyles.js";
import { focusAfterDraw } from "./focusAfterDraw.js";
import { makeRenderContext } from "./makeRenderContext.js";
/**
 * `<chat-window>`: the whole messenger, drawn as native Genesys Messenger: the launcher in the
 * corner and the panel above it. It holds the conversation state, feeds every event through
 * `reduceConversation`, and redraws. It decides nothing itself: the state comes from `core/`,
 * and every customer action leaves as a `chat-intent` event for the page to turn into SDK
 * commands. It is the only element with a shadow root; the elements inside it (`<chat-launcher>`,
 * `<chat-header>`, `<chat-home>`, `<chat-conversation>` and theirs) render into that root, so its
 * stylesheet (`chatStyles`) reaches them and their labels resolve.
 */
export class ChatWindow extends HTMLElement {
    #state = initialConversation;
    // The page element that had focus at the last panelOpened, for focus to return to when the
    // launcher is hidden.
    #opener;
    // The parts are created once and kept, so their rows, focus and scroll survive every redraw.
    #launcher = this.ownerDocument.createElement('chat-launcher');
    #panel = this.ownerDocument.createElement('section');
    #header = this.ownerDocument.createElement('chat-header');
    #home = this.ownerDocument.createElement('chat-home');
    #conversation = this.ownerDocument.createElement('chat-conversation');
    /**
     * Whether message text is read as Genesys rich text: the deployment's Rich Text Formatting
     * flag, which headless mode can't read (docs/guides/rich-text.md), so the page passes it as the
     * `markdown` attribute.
     *
     * @returns `false` when the `markdown` attribute is `off`; otherwise `true`.
     */
    get markdown() {
        return this.getAttribute('markdown') !== 'off';
    }
    /**
     * The conversation as last applied.
     *
     * @returns The current state; `initialConversation` before any event.
     */
    get state() {
        return this.#state;
    }
    /**
     * Opens the panel from the page's own code, as `Messenger.open` does for native: needed when
     * the deployment hides the launcher (`Off`, or `OnDemand` before anything showed it).
     *
     * @remarks Dispatches `{ kind: 'open' }` as a `chat-intent` event from this element, so the
     *   page records it like a launcher click. Does nothing while the panel is already open.
     */
    open() {
        if (!this.#state.panel.open)
            this.dispatchEvent(makeIntentEvent({ kind: 'open' }));
    }
    /**
     * Builds the element the first time it is attached, then draws.
     *
     * @remarks Builds once per element (re-attaching doesn't rebuild), then draws.
     */
    connectedCallback() {
        if (!this.shadowRoot)
            this.#build();
        this.#draw(this.#state.panel);
    }
    /**
     * Applies one event and redraws.
     *
     * @param event - An SDK event or a local one.
     * @remarks The new state is `reduceConversation(state, event)`; the draw runs when the element
     *   has been built (before that, the state is still kept). Then, after the draw:
     *   `returnedDraft(previous state, event)`, when defined, → `<chat-conversation>`'s
     *   `returnDraft`; `answerFailed` → its `reopenAnswer(messageId)`.
     *
     *   Building creates an open shadow root whose `adoptedStyleSheets` is exactly one
     *   `CSSStyleSheet` (from the element's own window) filled with `replaceSync(chatStyles)`, and
     *   no `<style>` element, so the page's CSP needs no hash of it (docs/hosting.md). The root
     *   holds a `<chat-launcher>`, then a `<section class="panel">` labelled `strings.headerTitle`
     *   holding a `<chat-header>`, a `<chat-home>` and a `<chat-conversation>`.
     *
     *   Drawing, from the state and `nativeLookAndFeel` while `lookAndFeel` is unset:
     *   - on the host, the custom properties `--chat-primary` (`primaryColor`),
     *     `--chat-on-primary` (`contrastText(primaryColor)`), `--chat-side-space` and
     *     `--chat-bottom-space` (`sideSpace` / `bottomSpace` + `px`); the attribute `data-side` =
     *     `resolveSide(alignment, direction)`, where direction is the host's computed `direction`
     *     (`rtl` or else `ltr`); and `data-launcher` = `shown` or `hidden` by `launcherShown`;
     *   - `launcher.update(launcherView(state, language))`, `header.update(headerView(state,
     *     language))`, where `language` is the document element's `lang`;
     *   - the panel `hidden` while `panel.open` is false; `<chat-home>` shown only for view `home`
     *     and given `homeView(state)`; `<chat-conversation>` shown only for view `conversation` and
     *     given the state; both with a context from `makeRenderContext` (`markdown`, `isAnswered` on
     *     the current state, `humanize` and `settings.disconnect`, `Off` before settings load);
     *   - focus by `focusAfterDraw(previous panel, panel, where focus was before the draw:
     *     `launcher` when on the launcher, `panel` when inside the panel, else `elsewhere`, the
     *     event's kind)`: `home` → `<chat-home>`'s `focusControl`, `conversation` →
     *     `<chat-conversation>`'s `focusControl`, `launcher` → `<chat-launcher>`'s `focusButton`
     *     while the launcher is shown, otherwise back to the page element that had focus when the
     *     panel last opened on a `panelOpened` (the page's own open button, when the deployment
     *     hides the launcher), if it is still in the document, else the page's first
     *     `[data-chat-open]` element (a panel first opened by `panelRestored` has no opener);
     *   - last, when `autoStartDue(state)`, dispatches `{ kind: 'start' }` (its `startRequested`
     *     sets `autoStartSpent`, so this happens once per opening).
     */
    receive(event) {
        const previous = this.#state;
        const draft = returnedDraft(previous, event);
        // Read before the draw moves focus into the panel.
        const active = this.ownerDocument.activeElement;
        this.#state = reduceConversation(previous, event);
        if (event.kind === 'panelOpened' && !previous.panel.open) {
            this.#opener = active instanceof HTMLElement && !this.contains(active) ? active : undefined;
        }
        if (this.shadowRoot)
            this.#draw(previous.panel, event.kind);
        if (draft !== undefined)
            this.#conversation.returnDraft(draft);
        if (event.kind === 'answerFailed')
            this.#conversation.reopenAnswer(event.messageId);
    }
    /**
     * Creates the shadow root, its stylesheet and the parts that persist.
     *
     * @remarks As `receive` describes the build: one adopted `CSSStyleSheet` from the element's own
     *   window filled with `chatStyles`, then the launcher and the labelled panel holding the
     *   header, home and conversation.
     */
    #build() {
        const root = this.attachShadow({ mode: 'open' });
        // The root accepts only a sheet from its own window, which isn't the global one in a frame.
        const sheet = new (this.ownerDocument.defaultView?.CSSStyleSheet ?? CSSStyleSheet)();
        sheet.replaceSync(chatStyles);
        root.adoptedStyleSheets = [sheet];
        this.#panel.className = 'panel';
        this.#panel.setAttribute('aria-label', strings.headerTitle);
        this.#panel.append(this.#header, this.#home, this.#conversation);
        root.append(this.#launcher, this.#panel);
    }
    /**
     * Redraws everything from the current state.
     *
     * @param previous - The panel before the event, for `focusAfterDraw`.
     * @param trigger - The event's kind, for `focusAfterDraw`; `undefined` for the first draw.
     * @remarks As `receive` describes the draw, in that order: focus place read first, then
     *   `#drawHost`, the parts, `#moveFocus`, and the autoStart dispatch last.
     */
    #draw(previous, trigger) {
        const state = this.#state;
        // Read before drawing: hiding a focused part drops focus to the page body.
        const place = this.#focusPlace();
        const language = this.ownerDocument.documentElement.lang;
        this.#drawHost(state);
        this.#launcher.update(launcherView(state, language));
        this.#header.update(headerView(state, language));
        this.#panel.hidden = !state.panel.open;
        this.#home.hidden = state.panel.view !== 'home';
        this.#conversation.hidden = state.panel.view !== 'conversation';
        const context = makeRenderContext(this, {
            markdown: this.markdown,
            isAnswered: (messageId) => isAnswered(this.#state, messageId),
            humanize: (state.lookAndFeel ?? nativeLookAndFeel).humanize,
            disconnect: state.settings?.disconnect ?? 'Off',
        });
        this.#home.update(homeView(state), context);
        this.#conversation.update(state, context);
        this.#moveFocus(focusAfterDraw(previous, state.panel, { focus: place, trigger: trigger }));
        if (autoStartDue(state))
            this.dispatchEvent(makeIntentEvent({ kind: 'start' }));
    }
    /**
     * Sets the host's theme custom properties and its `data-side` and `data-launcher` attributes.
     *
     * @param state - The conversation.
     * @remarks As `receive` describes them.
     */
    #drawHost(state) {
        const look = state.lookAndFeel ?? nativeLookAndFeel;
        const direction = getComputedStyle(this).direction === 'rtl' ? 'rtl' : 'ltr';
        this.style.setProperty('--chat-primary', look.primaryColor);
        this.style.setProperty('--chat-on-primary', contrastText(look.primaryColor));
        this.style.setProperty('--chat-side-space', `${String(look.sideSpace)}px`);
        this.style.setProperty('--chat-bottom-space', `${String(look.bottomSpace)}px`);
        this.setAttribute('data-side', resolveSide(look.alignment, direction));
        this.setAttribute('data-launcher', launcherShown(state) ? 'shown' : 'hidden');
    }
    /**
     * Where keyboard focus is in this element.
     *
     * @returns `launcher` when the shadow root's active element is inside the launcher, `panel`
     *   when inside the panel, else `elsewhere`.
     */
    #focusPlace() {
        const active = this.shadowRoot?.activeElement;
        if (!active)
            return 'elsewhere';
        if (this.#launcher.contains(active))
            return 'launcher';
        return this.#panel.contains(active) ? 'panel' : 'elsewhere';
    }
    /**
     * Moves focus where `focusAfterDraw` decided.
     *
     * @param target - `home` → the home card's `focusControl`; `conversation` → the
     *   conversation's `focusControl`; `launcher` → the launcher's `focusButton` while it is shown,
     *   else the remembered page opener's `focus()` when it is still connected, else the first
     *   `[data-chat-open]` element in the document, when there is one; `undefined` → nothing.
     */
    #moveFocus(target) {
        if (target === 'home')
            this.#home.focusControl();
        if (target === 'conversation')
            this.#conversation.focusControl();
        if (target !== 'launcher')
            return;
        if (launcherShown(this.#state)) {
            this.#launcher.focusButton();
            return;
        }
        const page = this.#opener?.isConnected
            ? this.#opener
            : this.ownerDocument.querySelector('[data-chat-open]');
        if (page instanceof HTMLElement)
            page.focus();
    }
}