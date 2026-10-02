import { makeIntentEvent } from "../makeIntentEvent.js";
/**
 * Builds the context the transcript and quick-reply renderers draw with, for one element.
 *
 * @param element - The `<chat-window>`: intents are dispatched from it as `chat-intent` events
 *   (`makeIntentEvent`), and rows are created in its `ownerDocument`.
 * @param options - What the element knows.
 * @param options.markdown - The deployment's Rich Text Formatting flag.
 * @param options.isAnswered - Whether an outbound picker or form has been answered, on the
 *   element's current state.
 * @param options.humanize - The deployment's humanize settings, passed through.
 * @param options.disconnect - The deployment's disconnect mode, passed through.
 * @returns A `RenderContext` with times in the customer's locale: `formatTime` and
 *   `formatSlotTime` as hour and two-digit minute, `formatDay` as weekday, day and month,
 *   `formatDate` as `Intl.DateTimeFormat` `dateStyle: 'medium'` ("Oct 2, 2026" in English),
 *   `formatDateTime` as `dateStyle: 'medium'` with `timeStyle: 'short'`; `humanize` and `disconnect`
 *   from the options.
 * @remarks Part of `<chat-window>`. Formats follow the runtime default locale and time zone.
 */
export const makeRenderContext = (element, options) => {
    const time = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
    const day = new Intl.DateTimeFormat(undefined, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });
    const date = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });
    const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    return {
        document: element.ownerDocument,
        dispatch: (intent) => {
            element.dispatchEvent(makeIntentEvent(intent));
        },
        markdown: options.markdown,
        isAnswered: options.isAnswered,
        formatTime: (epochMs) => time.format(epochMs),
        formatDay: (slot) => day.format(new Date(slot.dateTime)),
        formatSlotTime: (slot) => time.format(new Date(slot.dateTime)),
        formatDate: (epochMs) => date.format(epochMs),
        formatDateTime: (epochMs) => dateTime.format(epochMs),
        humanize: options.humanize,
        disconnect: options.disconnect,
    };
};