import { datePickerAnswer, groupSlots } from "../../core/index.js";
import { strings } from "../strings.js";
import { renderDayGroup } from "./renderDayGroup.js";
/**
 * Shows a date picker: its title and subtitle, then its slots grouped by the customer's local day.
 *
 * @param messageId - The outbound message carrying the picker.
 * @param picker - The picker.
 * @param context - Document, dispatch, `isAnswered`, and the slot formatters.
 * @returns A `<section class="date-picker">` with the title (`<h3>`), subtitle, and one group per
 *   `groupSlots(slots, context.formatDay)` entry, a `role="group"` named by its day label (via
 *   `aria-labelledby` and an id from a counter, never from SDK data), then one
 *   `<button type="button">` per slot labelled `formatSlotTime(slot)`. Clicking a slot dispatches `{ kind: 'postback',
 *   postback: datePickerAnswer(messageId, slot, day + ' ' + time) }` and then marks every slot
 *   button `aria-disabled="true"`; clicks on a marked button dispatch nothing, so a double click
 *   cannot answer twice. Not `disabled`, which would drop the keyboard focus of the button just
 *   pressed (`<chat-window>` clears the mark if the answer fails). When
 *   `context.isAnswered(messageId)`, the buttons are omitted and `strings.timeChosen` is shown; when
 *   there are no slots, `strings.noTimes`.
 * @remarks Sets no `innerHTML`.
 */
export const renderDatePicker = (messageId, picker, context) => {
    const doc = context.document;
    const section = Object.assign(doc.createElement('section'), { className: 'date-picker' });
    section.append(Object.assign(doc.createElement('h3'), { textContent: picker.title }));
    if (picker.subtitle !== undefined) {
        const subtitle = { className: 'subtitle', textContent: picker.subtitle };
        section.append(Object.assign(doc.createElement('p'), subtitle));
    }
    if (context.isAnswered(messageId) || picker.slots.length === 0) {
        const note = context.isAnswered(messageId) ? strings.timeChosen : strings.noTimes;
        const status = { className: 'status', textContent: note };
        section.append(Object.assign(doc.createElement('p'), status));
        return section;
    }
    section.append(...groupSlots(picker.slots, context.formatDay).map((group) => {
        const buttons = group.slots.map((slot) => {
            const props = { type: 'button', textContent: context.formatSlotTime(slot) };
            const button = Object.assign(doc.createElement('button'), props);
            button.addEventListener('click', () => {
                if (button.getAttribute('aria-disabled') === 'true')
                    return;
                const postback = datePickerAnswer(messageId, slot, `${group.day} ${props.textContent}`);
                context.dispatch({ kind: 'postback', postback });
                section.querySelectorAll('button').forEach((b) => {
                    b.setAttribute('aria-disabled', 'true');
                });
            });
            return button;
        });
        return renderDayGroup(doc, group.day, buttons);
    }));
    return section;
};