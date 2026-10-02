import { validateFile, validateText } from "../../core/index.js";
import { makeIconButton } from "../makeIconButton.js";
import { makeIntentEvent } from "../makeIntentEvent.js";
import { strings } from "../strings.js";
import { describeComposerError } from "./describeComposerError.js";
import { insertNewline } from "./insertNewline.js";
import { renderUploadStatus } from "./renderUploadStatus.js";
/**
 * `<chat-composer>`: where the customer types, attaches a file, and starts over, laid out as native
 * Messenger's composer (docs/guides/native-messenger-ui.md, "Composer"). Renders into its own light DOM (styled by `<chat-window>`). Every action leaves as a
 * `chat-intent` event (`makeIntentEvent`, dispatched from this element); validation uses
 * `validateText` and `validateFile`.
 */
export class ChatComposer extends HTMLElement {
    #view;
    // The compose elements are created once and kept, so the draft, caret and focus survive updates.
    #form = document.createElement('form');
    #textarea = document.createElement('textarea');
    #error = document.createElement('p');
    #attach = makeIconButton(document, 'attachFile', strings.attach);
    #fileInput = document.createElement('input');
    #send = makeIconButton(document, 'send', strings.send);
    // The upload status slot in the form; replaced by each `renderUploadStatus` draw.
    #upload = document.createElement('div');
    // JSON of the `{ upload, canAttach }` the attachment area was last drawn for; '' until the first draw.
    #renderedAttachments = '';
    // Text `returnDraft` was given outside compose mode, waiting for the next compose view; '' if none.
    #heldDraft = '';
    /**
     * Shows the controls for a view. Safe to call on every state change: typed text, the caret and
     * focus survive whenever the mode stays `compose`.
     *
     * @param view - What to show.
     * @remarks Remembers the view. By mode: `readOnly` → one `strings.startNew` button (class
     *   `primary start-new`) dispatching `{ kind: 'reset' }`, native's "Start new"; `compose` →
     *   `#renderCompose`, then any draft `returnDraft` held is put back and forgotten. Switching mode
     *   replaces the controls; when focus was inside this element, it moves to the new controls
     *   (`focusControl`), so a keyboard user isn't dropped to the top of the page.
     */
    update(view) {
        const modeChanged = view.mode !== this.#view?.mode;
        // Read before the swap: removing the focused control drops focus to the body.
        const root = this.getRootNode();
        const moveFocus = modeChanged && this.contains(root.activeElement);
        this.#view = view;
        if (view.mode === 'compose') {
            this.#renderCompose(view);
            const held = this.#heldDraft;
            this.#heldDraft = '';
            if (held !== '')
                this.returnDraft(held);
        }
        else if (modeChanged) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'primary start-new';
            button.textContent = strings.startNew;
            button.addEventListener('click', () => {
                this.dispatchEvent(makeIntentEvent({ kind: 'reset' }));
            });
            this.replaceChildren(button);
        }
        if (moveFocus)
            this.focusControl();
    }
    /**
     * Puts keyboard focus on the composer's main control.
     *
     * @remarks The textarea in `compose` mode; the "Start new" button in `readOnly`. Nothing happens
     *   before the first `update`.
     */
    focusControl() {
        (this.#view?.mode === 'compose' ? this.#textarea : this.querySelector('button'))?.focus();
    }
    /**
     * Gives back the text of a send that failed, so the customer doesn't have to type it again.
     *
     * @param text - The text that was submitted.
     * @remarks In `compose` mode: an empty textarea gets `text`; one holding a newer draft gets
     *   `text`, a newline, then that draft, so neither is lost. In any other mode (the conversation
     *   went read-only or ended before the refusal came back) the text is held, joined after any
     *   text already held with a newline, and `update` puts it back by the same rule when the
     *   composer next enters `compose` mode. Focus does not move.
     */
    returnDraft(text) {
        if (this.#view?.mode !== 'compose') {
            this.#heldDraft = this.#heldDraft === '' ? text : `${this.#heldDraft}\n${text}`;
            return;
        }
        const current = this.#textarea.value;
        this.#textarea.value = current === '' ? text : `${text}\n${current}`;
        this.#refreshSend();
    }
    /**
     * Builds the compose controls once, then refreshes only the attachment controls.
     *
     * @param view - The current view.
     * @remarks A `<form>` holding, in order: a `<textarea>` labelled `strings.composerLabel`
     *   (placeholder `strings.composerPlaceholder`, `aria-describedby` the error element); a
     *   `<div class="actions">` with the attach button (`makeIconButton('attachFile',
     *   strings.attach)`, class `attach`) and its hidden `<input type="file">`, then the send button
     *   (`makeIconButton('send', strings.send)`, class `send`, `type="submit"`); the upload status
     *   slot; and a `role="alert"` error element. The send button is `disabled` while the text is
     *   blank and no file is staged, re-checked on every input, every update, after each send and
     *   whenever `returnDraft` changes the text (native disables it until there is something to
     *   send). Submit (default prevented) and Enter without Shift or Ctrl call `#submit`, except
     *   while an IME composition is in progress (`isComposing`). Ctrl+Enter inserts a newline at the
     *   caret instead (`insertNewline`), as native does (browsers insert nothing for it), then
     *   re-checks the send button. Input with
     *   non-blank text dispatches `{ kind: 'typing' }` when `view.sendTyping`. The attach button
     *   clears the file input and opens it (cleared before the picker, never after the choice:
     *   clearing it empties the very `FileList` the upload intent carries); its change calls
     *   `#chooseFile`.
     */
    #renderCompose(view) {
        if (this.#form.childElementCount === 0) {
            this.#error.id = 'chat-composer-error';
            this.#error.setAttribute('role', 'alert');
            this.#textarea.setAttribute('aria-label', strings.composerLabel);
            this.#textarea.setAttribute('aria-describedby', this.#error.id);
            this.#textarea.placeholder = strings.composerPlaceholder;
            this.#form.append(this.#textarea, this.#buildActions(), this.#upload, this.#error);
            this.#form.addEventListener('submit', (event) => {
                event.preventDefault();
                this.#submit();
            });
            this.#textarea.addEventListener('keydown', (event) => {
                if (event.key !== 'Enter' || event.shiftKey || event.isComposing)
                    return;
                event.preventDefault();
                if (!event.ctrlKey) {
                    this.#submit();
                    return;
                }
                insertNewline(this.#textarea);
                this.#refreshSend();
            });
            this.#textarea.addEventListener('input', () => {
                this.#refreshSend();
                if (this.#view?.sendTyping !== true || this.#textarea.value.trim() === '')
                    return;
                this.dispatchEvent(makeIntentEvent({ kind: 'typing' }));
            });
        }
        if (this.#form.parentNode !== this)
            this.replaceChildren(this.#form);
        this.#renderAttachments(view);
        this.#refreshSend();
    }
    /**
     * Refreshes the attach button and the upload status for the view.
     *
     * @param view - The current view.
     * @remarks The attach button is shown only when `view.canAttach` and `upload` is `none`. The
     *   upload status slot is replaced by `renderUploadStatus(upload, document, remove)`, where
     *   `remove(id)` dispatches `{ kind: 'removeUpload', attachmentId: id }`. Nothing changes when
     *   `view.upload` and `view.canAttach` are the same (by JSON) as last time, so a redraw never
     *   steals focus from these buttons.
     */
    #renderAttachments(view) {
        const { upload, canAttach } = view;
        const rendered = JSON.stringify({ upload, canAttach });
        if (rendered === this.#renderedAttachments)
            return;
        this.#renderedAttachments = rendered;
        this.#attach.hidden = !canAttach || upload.kind !== 'none';
        const status = renderUploadStatus(upload, document, (attachmentId) => {
            this.dispatchEvent(makeIntentEvent({ kind: 'removeUpload', attachmentId }));
        });
        this.#upload.replaceWith(status);
        this.#upload = status;
    }
    /**
     * Keeps the send button's `disabled` in step with whether there is something to send.
     *
     * @remarks Disabled exactly while the textarea's text is blank after trimming and the current
     *   view's upload is not `staged`. Called from the input listener, every compose `update`, after
     *   a successful send, and from `returnDraft` in compose mode.
     */
    #refreshSend() {
        const blank = this.#textarea.value.trim() === '';
        this.#send.disabled = blank && this.#view?.upload.kind !== 'staged';
    }
    /**
     * Builds the row of compose buttons, once.
     *
     * @returns A `<div class="actions">` holding the attach button (class `attach`; a click clears
     *   the file input, then opens it), the hidden `<input type="file">` (change → `#chooseFile`),
     *   and the send button (class `send`, `type="submit"`).
     */
    #buildActions() {
        this.#attach.classList.add('attach');
        this.#attach.addEventListener('click', () => {
            this.#fileInput.value = '';
            this.#fileInput.click();
        });
        this.#fileInput.type = 'file';
        this.#fileInput.hidden = true;
        this.#fileInput.addEventListener('change', () => {
            if (this.#fileInput.files)
                this.#chooseFile(this.#fileInput.files);
        });
        this.#send.classList.add('send');
        this.#send.type = 'submit';
        const actions = document.createElement('div');
        actions.className = 'actions';
        actions.append(this.#attach, this.#fileInput, this.#send);
        return actions;
    }
    /**
     * Sends what was typed.
     *
     * @remarks `validateText(text, upload is staged)`: on success dispatches `{ kind: 'send', text }`,
     *   clears the textarea and the error, and keeps focus in the textarea; on failure shows
     *   `describeComposerError` in the error element.
     */
    #submit() {
        const checked = validateText(this.#textarea.value, this.#view?.upload.kind === 'staged');
        if (!checked.ok) {
            this.#error.textContent = describeComposerError(checked.error);
            return;
        }
        this.#textarea.value = '';
        this.#error.textContent = '';
        this.#refreshSend();
        this.dispatchEvent(makeIntentEvent({ kind: 'send', text: checked.value }));
        this.#textarea.focus();
    }
    /**
     * Checks and uploads the chosen file.
     *
     * @param files - The file input's list; only the first file is used (the SDK takes one).
     * @remarks Nothing happens for an empty list. `validateFile(file, view.filePolicy)`: on success
     *   dispatches `{ kind: 'upload', files }` and clears the error; on failure shows
     *   `describeComposerError`.
     */
    #chooseFile(files) {
        const file = files[0];
        if (file === undefined)
            return;
        const checked = validateFile(file, this.#view?.filePolicy);
        if (!checked.ok) {
            this.#error.textContent = describeComposerError(checked.error);
            return;
        }
        this.#error.textContent = '';
        this.dispatchEvent(makeIntentEvent({ kind: 'upload', files }));
    }
}