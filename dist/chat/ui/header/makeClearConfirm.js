import { strings } from "../strings.js";
import { wireConfirmKeys } from "./wireConfirmKeys.js";
/**
 * Builds native's Clear confirmation and wires the bin button to it.
 *
 * @param document - The document to create it with.
 * @param bin - The bin button that opens it, and gets focus back on Cancel.
 * @param onYes - Called when the customer confirms.
 * @returns A hidden `<div class="confirm" role="alertdialog" aria-modal="true">` whose
 *   `aria-labelledby` names its `<p>` of `strings.clearConfirm`; the `<p>`'s id is
 *   `chat-header-confirm-` plus a random base-36 suffix (`Math.random`), unique enough for one
 *   page and available over plain HTTP, where `crypto.randomUUID` is not. Then a
 *   `strings.clearYes` button (class `primary`: hides the dialog, then `onYes()`) and a
 *   `strings.cancel` button (hides it and focuses `bin`). Yes focuses `bin` before hiding the
 *   dialog, so focus stays in the panel until the clear lands (live, `conversationCleared`
 *   arrives in a later task) and `<chat-window>` can then hand it to the launcher. A click on
 *   `bin` shows the dialog and focuses Cancel. While open it is modal for the keyboard: Escape
 *   takes the Cancel path, and Tab / Shift+Tab cycle between its two buttons without leaving it
 *   (the backdrop already catches pointer clicks).
 * @remarks Sets no `innerHTML`. Part of `<chat-header>`; tested through it.
 */
export const makeClearConfirm = (document, bin, onYes) => {
    const label = document.createElement('p');
    label.id = `chat-header-confirm-${Math.random().toString(36).slice(2)}`;
    label.textContent = strings.clearConfirm;
    const yes = document.createElement('button');
    yes.type = 'button';
    yes.className = 'primary';
    yes.textContent = strings.clearYes;
    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.textContent = strings.cancel;
    const confirm = document.createElement('div');
    confirm.className = 'confirm';
    confirm.setAttribute('role', 'alertdialog');
    confirm.setAttribute('aria-modal', 'true');
    confirm.setAttribute('aria-labelledby', label.id);
    confirm.hidden = true;
    confirm.append(label, yes, cancel);
    yes.addEventListener('click', () => {
        bin.focus();
        confirm.hidden = true;
        onYes();
    });
    cancel.addEventListener('click', () => {
        confirm.hidden = true;
        bin.focus();
    });
    bin.addEventListener('click', () => {
        confirm.hidden = false;
        cancel.focus();
    });
    wireConfirmKeys(confirm, yes, cancel);
    return confirm;
};