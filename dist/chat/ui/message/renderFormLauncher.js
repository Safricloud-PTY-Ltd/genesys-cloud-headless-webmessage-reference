import { toSafeUrl } from "../../core/index.js";
import { strings } from "../strings.js";
import { isFormOpener } from "./isFormOpener.js";
/**
 * Shows a form's prompt card with a button that opens the form in place.
 *
 * @param messageId - The outbound message carrying the form.
 * @param form - The form.
 * @param context - Document, dispatch and `isAnswered`.
 * @returns A `<section class="form-launcher">` with the prompt `title` (`<h3>`), `subtitle` and a
 *   safe https `image`, and a `<button type="button">` (`strings.formStart`). Clicking it hides the
 *   button and appends a `<chat-form>` element to the section, then calls its
 *   `open(messageId, form)`. When `context.isAnswered(messageId)`, the button is replaced by the
 *   text `strings.formAnswered`.
 * @remarks Sets no `innerHTML`. Relies on `<chat-form>` being defined.
 */
export const renderFormLauncher = (messageId, form, context) => {
    const { document } = context;
    const section = document.createElement('section');
    section.className = 'form-launcher';
    section.append(Object.assign(document.createElement('h3'), { textContent: form.title }));
    if (form.subtitle !== undefined) {
        section.append(Object.assign(document.createElement('p'), { textContent: form.subtitle }));
    }
    const src = form.image === undefined ? undefined : toSafeUrl(form.image, ['https:']);
    if (src !== undefined) {
        const image = document.createElement('img');
        image.src = src;
        image.alt = '';
        section.append(image);
    }
    if (context.isAnswered(messageId)) {
        section.append(Object.assign(document.createElement('p'), { textContent: strings.formAnswered }));
        return section;
    }
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = strings.formStart;
    button.addEventListener('click', () => {
        button.hidden = true;
        const chatForm = document.createElement('chat-form');
        section.append(chatForm);
        if (isFormOpener(chatForm)) {
            chatForm.open(messageId, form);
        }
    });
    section.append(button);
    return section;
};