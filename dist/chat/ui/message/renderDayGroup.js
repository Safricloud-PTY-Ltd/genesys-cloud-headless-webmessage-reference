// aria-labelledby needs a document-unique id. SDK data can't supply one: the same picker can be
// rendered twice (a redraw, or one message shown again), so the id comes from a counter that
// outlives each call.
const dayLabelIds = { next: 0 };
/**
 * Groups one day's time slots under its day label, so assistive tech announces the day with them.
 *
 * @param document - The document to create elements with.
 * @param day - The day label ("Thursday, 2 October").
 * @param buttons - The day's slot buttons, in order.
 * @returns A `<div class="day" role="group" aria-labelledby=ID>` holding an `<h4 id=ID>` with the
 *   label, then a `<div class="slots">` with the buttons. ID comes from a module-level counter
 *   (never from SDK data), so two renders of the same message never share an id.
 * @remarks Sets no `innerHTML`. Part of `renderDatePicker`; tested through it.
 */
export const renderDayGroup = (document, day, buttons) => {
    dayLabelIds.next += 1;
    const id = `date-picker-day-${dayLabelIds.next}`;
    const label = Object.assign(document.createElement('h4'), { id, textContent: day });
    const slots = Object.assign(document.createElement('div'), { className: 'slots' });
    slots.append(...buttons);
    const group = Object.assign(document.createElement('div'), { className: 'day' });
    group.setAttribute('role', 'group');
    group.setAttribute('aria-labelledby', id);
    group.append(label, slots);
    return group;
};