import { listPickerAnswer } from "../../core/index.js";
import { strings } from "../strings.js";
import { lockListPicker } from "./lockListPicker.js";
import { renderListSection } from "./renderListSection.js";
/**
 * Shows a list picker as a form: one fieldset per section, radio buttons for a single-choice
 * section and checkboxes for a multiple-choice one, and a send button.
 *
 * @param messageId - The outbound message carrying the picker.
 * @param picker - The picker.
 * @param context - Document, dispatch and `isAnswered`.
 * @returns A `<form class="list-picker">` with the prompt title and subtitle, a `<fieldset>` with a
 *   `<legend>` per section, an input per item (`value` = item id, each section's radios sharing a
 *   `name` unique to this message and section) whose `<label>` shows title and subtitle, and a
 *   submit button (`strings.listSubmit`). On submit (default prevented) it collects the checked ids
 *   in document order and calls `listPickerAnswer`: on success dispatches `{ kind: 'postback',
 *   postback }`, then disables its fieldsets and marks the button `aria-disabled="true"` (a
 *   marked button submits nothing; not `disabled`, which would drop the focus of the button just
 *   pressed; `<chat-window>` undoes both if the answer fails); on `NothingSelected` shows `strings.nothingSelected` in an element with
 *   `role="alert"`. When `context.isAnswered(messageId)`, the inputs and button are disabled and
 *   `strings.listAnswered` is shown.
 * @remarks Sets no `innerHTML`.
 */
export const renderListPicker = (messageId, picker, context) => {
    const doc = context.document;
    const form = Object.assign(doc.createElement('form'), { className: 'list-picker' });
    form.append(Object.assign(doc.createElement('h3'), { textContent: picker.title }));
    if (picker.subtitle !== undefined) {
        form.append(Object.assign(doc.createElement('p'), { textContent: picker.subtitle }));
    }
    const fieldsets = picker.sections.map((section, index) => renderListSection(doc, `lp-${messageId}-${index}`, section));
    const alert = doc.createElement('p');
    alert.setAttribute('role', 'alert');
    const button = Object.assign(doc.createElement('button'), {
        type: 'submit',
        textContent: strings.listSubmit,
    });
    form.append(...fieldsets, alert, button);
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (button.getAttribute('aria-disabled') === 'true')
            return;
        const checked = [...form.querySelectorAll('input:checked')];
        const ids = checked.map((input) => input.value);
        const answer = listPickerAnswer(messageId, picker, ids);
        if (answer.ok) {
            context.dispatch({ kind: 'postback', postback: answer.value });
            lockListPicker(fieldsets, button);
        }
        else {
            alert.textContent = strings.nothingSelected;
        }
    });
    if (context.isAnswered(messageId)) {
        [...fieldsets, button].forEach((control) => control.toggleAttribute('disabled', true));
        form.append(Object.assign(doc.createElement('p'), { textContent: strings.listAnswered }));
    }
    return form;
};