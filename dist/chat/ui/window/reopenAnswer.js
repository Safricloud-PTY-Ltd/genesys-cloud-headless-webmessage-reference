import { ChatForm } from "../form/index.js";
/**
 * Lets the customer answer a picker or form again after the answer failed to send.
 *
 * @param list - The transcript list.
 * @param messageId - The outbound message whose answer failed.
 * @remarks Calls `answerFailed(messageId)` on every `<chat-form>` in `list` (the one for that message
 *   re-enables itself), and enables every fieldset, button, input and select in the list's child
 *   whose `data-key` is `m:` + `messageId` (and removes `aria-disabled` from its buttons), since date and list pickers disable themselves when they
 *   send. The row is found by comparing that text, never by building a selector from the id: a
 *   message id is SDK data, and a quote or a backslash in it would make a selector throw.
 *   Part of `<chat-window>`; tested through it.
 */
export const reopenAnswer = (list, messageId) => {
    Array.from(list.querySelectorAll('chat-form'))
        .filter((element) => element instanceof ChatForm)
        .forEach((form) => {
        form.answerFailed(messageId);
    });
    const row = Array.from(list.children).find((child) => child.getAttribute('data-key') === `m:${messageId}`);
    row
        ?.querySelectorAll('fieldset, button, input, select')
        .forEach((control) => {
        control.disabled = false;
    });
    row?.querySelectorAll('button').forEach((button) => {
        button.removeAttribute('aria-disabled');
    });
};