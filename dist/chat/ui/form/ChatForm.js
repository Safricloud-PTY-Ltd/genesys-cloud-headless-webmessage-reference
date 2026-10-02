var _a;
import { formAnswer, formStepAt, formStepCount, formStepOfField, missingFields, } from "../../core/index.js";
import { makeIntentEvent } from "../makeIntentEvent.js";
import { strings } from "../strings.js";
import { renderFormField } from "./renderFormField.js";
import { renderFormIntro } from "./renderFormIntro.js";
import { renderFormSummary } from "./renderFormSummary.js";
import { renderStepHeading } from "./renderStepHeading.js";
/**
 * `<chat-form>`: a multi-page Genesys form, answered in place inside a message. Steps are the
 * introduction (when the form has one), each page, then a summary (when `showSummary`). Renders
 * into its own light DOM, so it is styled by, and its labels resolve inside, `<chat-window>`'s
 * shadow root. Behaviour follows Genesys' own UI (structured-messages.md).
 */
export class ChatForm extends HTMLElement {
    // A per-class count, not randomness or a clock, keeps two forms on a page from sharing ids.
    static #created = 0;
    #idPrefix = `chat-form-${String((_a.#created += 1))}-`;
    #messageId;
    #form;
    #step = 0;
    #values = {};
    #invalid = [];
    /**
     * Shows a form from its first step, forgetting any earlier one.
     *
     * @param messageId - The outbound message carrying the form; the answer replies to it.
     * @param form - The form.
     * @remarks Resets the values and invalid set, then draws with `#renderStep`.
     */
    open(messageId, form) {
        this.#messageId = messageId;
        this.#form = form;
        this.#step = 0;
        this.#values = {};
        this.#invalid = [];
        this.#renderStep();
    }
    /**
     * Lets the customer send the answer again after it failed to send.
     *
     * @param messageId - The message whose answer failed.
     * @remarks When `messageId` is the open form's, clears the mark `#submit` put on every button. The
     *   step and the typed values stay as they were. Any other id: nothing happens.
     */
    answerFailed(messageId) {
        if (messageId !== this.#messageId)
            return;
        this.querySelectorAll('button').forEach((button) => {
            button.removeAttribute('aria-disabled');
        });
    }
    /**
     * Draws the current step, replacing what the element showed before.
     *
     * @remarks A `<form>` (submission default prevented) holding: on the introduction step, its
     *   title, subtitle, safe https image and a `buttonText` button that moves on; on a page step,
     *   the page title, subtitle and one `renderFormField` per field (id prefix unique to this
     *   element, `invalid` for ids in the invalid set, `onChange` storing the value); on the summary
     *   step, `renderFormSummary`. Then Back (not on the first step), Next (`strings.formNext`, not
     *   on the last) and Send (`strings.formSend`, on the last). Focus moves to the step's heading,
     *   or to the first invalid control when there is one.
     */
    #renderStep() {
        const form = this.#form;
        if (form === undefined)
            return;
        const doc = this.ownerDocument;
        const step = formStepAt(form, this.#step);
        const content = step.kind === 'introduction'
            ? renderFormIntro(step.introduction, doc)
            : step.kind === 'page'
                ? this.#renderPage(step.page)
                : [
                    ...renderStepHeading(strings.formSummary, undefined, doc),
                    renderFormSummary(form, this.#values, doc),
                ];
        const formElement = doc.createElement('form');
        formElement.addEventListener('submit', (event) => {
            event.preventDefault();
        });
        formElement.append(...content, ...this.#renderActions(step));
        this.replaceChildren(formElement);
        const focusTarget = this.querySelector('[aria-invalid="true"]') ??
            this.querySelector('h3');
        focusTarget?.focus();
    }
    /**
     * Moves to the next step when the current page is complete.
     *
     * @remarks On a page step, `missingFields(page, values)` non-empty → those ids become the invalid
     *   set and the step stays; otherwise the invalid set is cleared and the step advances. Other
     *   steps always advance. Redraws.
     */
    #goNext() {
        const form = this.#form;
        if (form === undefined)
            return;
        const step = formStepAt(form, this.#step);
        this.#invalid = step.kind === 'page' ? missingFields(step.page, this.#values) : [];
        this.#step = this.#invalid.length > 0 ? this.#step : this.#step + 1;
        this.#renderStep();
    }
    /**
     * Sends the answer.
     *
     * @remarks `formAnswer(messageId, form, values)`: on success dispatches
     *   `makeIntentEvent({ kind: 'postback', postback })` from this element and marks every
     *   button `aria-disabled="true"` (marked buttons do nothing; not `disabled`, which would drop the
     *   focus of the Send just pressed); on `FormIncomplete` makes those ids the invalid set and moves to the first page that
     *   holds one. Typed values survive moving between steps.
     */
    #submit() {
        const form = this.#form;
        const messageId = this.#messageId;
        if (form === undefined || messageId === undefined)
            return;
        const answer = formAnswer(messageId, form, this.#values);
        if (answer.ok) {
            this.dispatchEvent(makeIntentEvent({ kind: 'postback', postback: answer.value }));
            this.querySelectorAll('button').forEach((button) => {
                button.setAttribute('aria-disabled', 'true');
            });
            return;
        }
        this.#invalid = answer.error.fieldIds;
        this.#step = formStepOfField(form, answer.error.fieldIds) ?? this.#step;
        this.#renderStep();
    }
    /**
     * The fields of one page.
     *
     * @param page - The page.
     * @returns `renderStepHeading(page.title, page.subtitle)` then one `renderFormField` per field,
     *   with this element's id prefix, `invalid` for ids in the invalid set, and `onChange` storing
     *   the value.
     */
    #renderPage(page) {
        const doc = this.ownerDocument;
        return [
            ...renderStepHeading(page.title, page.subtitle, doc),
            ...page.fields.map((field) => renderFormField(field, {
                document: doc,
                value: this.#values[field.id],
                invalid: this.#invalid.includes(field.id),
                idPrefix: this.#idPrefix,
                onChange: (value) => {
                    this.#values = { ...this.#values, [field.id]: value };
                },
            })),
        ];
    }
    /**
     * The navigation buttons of a step.
     *
     * @param step - The step being drawn.
     * @returns Back (not on the first step) wired to `#goBack`; then, on the last step, Send
     *   (`strings.formSend`, type submit) wired to `#submit`; otherwise the introduction's
     *   `buttonText` on the introduction step or Next (`strings.formNext`) elsewhere, wired to
     *   `#goNext`.
     */
    #renderActions(step) {
        const form = this.#form;
        if (form === undefined)
            return [];
        const isLast = this.#step >= formStepCount(form) - 1;
        const next = step.kind === 'introduction' ? step.introduction.buttonText : strings.formNext;
        const back = { text: strings.formBack, type: 'button', run: this.#goBack.bind(this) };
        const actions = [
            ...(this.#step > 0 ? [back] : []),
            isLast
                ? { text: strings.formSend, type: 'submit', run: this.#submit.bind(this) }
                : { text: next, type: 'button', run: this.#goNext.bind(this) },
        ];
        return actions.map(({ text, type, run }) => {
            const button = this.ownerDocument.createElement('button');
            button.type = type;
            button.textContent = text;
            button.addEventListener('click', () => {
                if (button.getAttribute('aria-disabled') !== 'true')
                    run();
            });
            return button;
        });
    }
    /**
     * Moves to the previous step and redraws; nothing on the first step.
     */
    #goBack() {
        if (this.#step === 0)
            return;
        this.#step -= 1;
        this.#renderStep();
    }
}
_a = ChatForm;