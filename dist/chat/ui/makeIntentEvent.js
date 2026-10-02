/** The DOM event every chat element uses to say what the customer asked for. */
export const chatIntentEvent = 'chat-intent';
/**
 * Wraps a customer intent in the DOM event the page listens for.
 *
 * @param intent - What the customer asked for.
 * @returns A `CustomEvent` named `chatIntentEvent` with `detail` = `intent`, `bubbles` and
 *   `composed` set so it leaves the shadow root of `<chat-window>`.
 * @remarks Creates the event; the caller dispatches it.
 */
export const makeIntentEvent = (intent) => new CustomEvent(chatIntentEvent, { detail: intent, bubbles: true, composed: true });