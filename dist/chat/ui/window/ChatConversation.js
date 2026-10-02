import { canAnswer, latestQuickReplies } from "../../core/index.js";
import { makeButton } from "../makeButton.js";
import { makeIntentEvent } from "../makeIntentEvent.js";
import { strings } from "../strings.js";
import { composerView } from "./composerView.js";
import { isFocusLost } from "./isFocusLost.js";
import { makeScrollFollower } from "./makeScrollFollower.js";
import { noticeText } from "./noticeText.js";
import { renderQuickReplies } from "./renderQuickReplies.js";
import { reopenAnswer } from "./reopenAnswer.js";
import { statusText } from "./statusText.js";
import { syncTranscript } from "./syncTranscript.js";
import { transcriptEntries } from "./transcriptEntries.js";
/**
 * `<chat-conversation>`: the conversation screen of the panel, everything below the header:
 * status lines, notices, the transcript, the typing indicator, quick replies and the composer.
 * It decides nothing itself; `<chat-window>` gives it the state. Renders into its own light DOM
 * inside `<chat-window>`'s shadow root, which styles it, so labels and `aria-*` references
 * resolve there.
 */
export class ChatConversation extends HTMLElement {
    // The parts are created once and kept, so rows, focus and scroll position survive every redraw.
    #dismiss = makeButton(document, strings.dismiss, () => {
        this.dispatchEvent(makeIntentEvent({ kind: 'dismissNotice' }));
    });
    #older = makeButton(document, strings.loadOlder, () => {
        this.dispatchEvent(makeIntentEvent({ kind: 'loadOlder' }));
    });
    #status = document.createElement('p');
    #warning = document.createElement('p');
    #notice = document.createElement('div');
    #noticeText = document.createElement('span');
    #loading = document.createElement('p');
    #scroller = document.createElement('div');
    #gate = document.createElement('fieldset');
    #list = document.createElement('ol');
    #typing = document.createElement('p');
    #typingLabel = document.createElement('span');
    #quickReplies = document.createElement('div');
    // JSON of the replies last drawn; no list serialises to '', so the first draw always renders.
    #drawnQuickReplies = '';
    #composer = document.createElement('chat-composer');
    // Set by #build, so it also marks whether the parts exist yet.
    #follower;
    /**
     * Draws every part from a state. Safe to call on every state change; the parts are created on
     * the first call and kept, so rows, focus and scroll position survive.
     *
     * @param state - The conversation.
     * @param context - The render context for rows and quick replies.
     * @remarks Parts, in order: a status line (`role="status"`, class `status`) from `statusText`
     *   (empty when `undefined`); a session warning (`role="status"`, class `session-warning`,
     *   `strings.sessionWarning` and `context.formatTime(sessionExpiresAt)` while set, else empty);
     *   a notice (`role="alert"`, class `notice`) of `noticeText` with a `strings.dismiss` button
     *   dispatching `{ kind: 'dismissNotice' }`, hidden while unset; a scroller (class `scroller`)
     *   holding a "Show earlier messages" button (class `history`, dispatching `{ kind:
     *   'loadOlder' }`, shown only while `history` is `available` and the phase is not `idle`), a
     *   `strings.loadingOlder` note (class `history-note`) shown only while `loading`, and an
     *   `<ol class="transcript" role="log" aria-live="polite">` labelled `strings.transcriptLabel`
     *   inside a `<fieldset class="answer-gate">` whose `disabled` is `!canAnswer(state)`; the rows
     *   come from `syncTranscript(list, transcriptEntries(state, context))`; a typing indicator
     *   (`role="status"`, class `typing`) holding three `<span class="dot">` and a visually hidden
     *   `strings.agentTyping`, hidden unless `agentTyping`; the quick replies from
     *   `renderQuickReplies(latestQuickReplies(state), context)`, replaced only when that list's
     *   JSON changes; and a `<chat-composer>` given `composerView(state)`. When something inside
     *   this element had focus before the update and nothing does after it (`isFocusLost` on the
     *   root), focus moves to the composer's `focusControl()`. Last, the scroll follower
     *   (`makeScrollFollower(scroller, list)`) is pinned. Status line and warning stay in the
     *   accessibility tree while empty, so a later change is announced.
     */
    update(state, context) {
        const root = this.getRootNode();
        // Read before drawing: hiding or replacing a focused control drops focus to the page body.
        const hadFocus = root instanceof ShadowRoot && this.contains(root.activeElement);
        if (this.#follower === undefined)
            this.#build();
        this.#drawStatus(state, context);
        this.#drawTranscript(state, context);
        this.#gate.disabled = !canAnswer(state);
        this.#typing.hidden = !state.agentTyping;
        // Emptied while hidden, so the label is in no text but the indicator's while it shows.
        this.#typingLabel.textContent = state.agentTyping ? strings.agentTyping : '';
        this.#drawQuickReplies(state, context);
        this.#composer.update(composerView(state));
        if (hadFocus && isFocusLost(root))
            this.#composer.focusControl();
        this.#follower?.pin();
    }
    /**
     * Gives a failed send's text back to the composer (`<chat-composer>`'s `returnDraft`).
     *
     * @param text - The text that was submitted.
     * @remarks Does nothing before the first `update`.
     */
    returnDraft(text) {
        if (this.#follower !== undefined)
            this.#composer.returnDraft(text);
    }
    /**
     * Lets the customer answer a picker or form again after its answer failed to send.
     *
     * @param messageId - The outbound message whose answer failed.
     * @remarks `reopenAnswer(list, messageId)` on the transcript list. Does nothing before the
     *   first `update`.
     */
    reopenAnswer(messageId) {
        if (this.#follower !== undefined)
            reopenAnswer(this.#list, messageId);
    }
    /**
     * Puts keyboard focus on the composer's main control: the message field, or "Start new".
     *
     * @remarks Does nothing before the first `update`.
     */
    focusControl() {
        if (this.#follower !== undefined)
            this.#composer.focusControl();
    }
    /**
     * Makes the parts once, in this element's light DOM, and the scroll follower.
     *
     * @remarks Classes, roles and labels as `update` describes them; the typing indicator's three
     *   `span.dot` and visually hidden label; the gate around the list; the scroller around the
     *   history button, the loading note and the gate; everything appended in `update`'s order.
     */
    #build() {
        this.#status.className = 'status';
        this.#status.setAttribute('role', 'status');
        this.#warning.className = 'session-warning';
        this.#warning.setAttribute('role', 'status');
        this.#notice.className = 'notice';
        this.#notice.setAttribute('role', 'alert');
        this.#notice.append(this.#noticeText, this.#dismiss);
        this.#older.className = 'history';
        this.#loading.className = 'history-note';
        this.#list.className = 'transcript';
        this.#list.setAttribute('role', 'log');
        this.#list.setAttribute('aria-live', 'polite');
        this.#list.setAttribute('aria-label', strings.transcriptLabel);
        this.#gate.className = 'answer-gate';
        this.#gate.append(this.#list);
        this.#scroller.className = 'scroller';
        this.#scroller.append(this.#older, this.#loading, this.#gate);
        this.#typingLabel.className = 'visually-hidden';
        const dots = Array.from({ length: 3 }, () => {
            const dot = document.createElement('span');
            dot.className = 'dot';
            return dot;
        });
        this.#typing.className = 'typing';
        this.#typing.setAttribute('role', 'status');
        this.#typing.append(...dots, this.#typingLabel);
        this.append(this.#status, this.#warning, this.#notice, this.#scroller);
        this.append(this.#typing, this.#quickReplies, this.#composer);
        this.#follower = makeScrollFollower(this.#scroller, this.#list);
    }
    /**
     * Draws the status line, the session warning and the notice.
     *
     * @param state - The conversation.
     * @param context - For formatting the expiry time.
     * @remarks As `update` describes them.
     */
    #drawStatus(state, context) {
        const { notice, sessionExpiresAt } = state;
        this.#status.textContent = statusText(state) ?? '';
        this.#warning.textContent =
            sessionExpiresAt === undefined
                ? ''
                : `${strings.sessionWarning} ${context.formatTime(sessionExpiresAt)}`;
        this.#notice.hidden = notice === undefined;
        this.#noticeText.textContent = notice === undefined ? '' : noticeText(notice);
    }
    /**
     * Draws the history control, the loading note and the transcript rows.
     *
     * @param state - The conversation.
     * @param context - Passed to `transcriptEntries`.
     * @remarks As `update` describes them; scrolling is left to the follower.
     */
    #drawTranscript(state, context) {
        const idle = state.phase === 'idle';
        this.#older.hidden = idle || state.history !== 'available';
        this.#loading.hidden = idle || state.history !== 'loading';
        this.#loading.textContent = this.#loading.hidden ? '' : strings.loadingOlder;
        syncTranscript(this.#list, transcriptEntries(state, context));
    }
    /**
     * Redraws the quick replies, but only when the list to show has changed.
     *
     * @param state - The conversation.
     * @param context - The render context.
     * @remarks Replaces the slot with `renderQuickReplies(latestQuickReplies(state), context)` only
     *   when that list's JSON differs from the one last drawn, so an unrelated event never steals a
     *   reply button's focus.
     */
    #drawQuickReplies(state, context) {
        const latest = latestQuickReplies(state);
        const drawn = JSON.stringify(latest);
        if (drawn === this.#drawnQuickReplies)
            return;
        const replies = renderQuickReplies(latest, context);
        this.#quickReplies.replaceWith(replies);
        this.#quickReplies = replies;
        this.#drawnQuickReplies = drawn;
    }
}