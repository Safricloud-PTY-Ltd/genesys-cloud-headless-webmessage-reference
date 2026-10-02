/**
 * Subscribes once to each named `MessagingService` event on the `Genesys` queue.
 *
 * @param genesys - The command queue. Subscribing before the SDK has loaded is safe: the queue
 *   replays calls in order once it loads, so no early event is missed.
 * @param names - Event names without the plugin prefix (`messagesReceived`). May be empty.
 * @param onEvent - Called with the short name and the raw callback argument (the envelope
 *   `{ event, data, ... }`, unparsed) every time one of the events is published.
 * @remarks There is no way to unsubscribe from the queue (sdk-source-notes.md), so call this once per page. Calls `genesys('subscribe', 'MessagingService.' + name, callback)` once per name, in
 *   order.
 */
export const subscribeAll = (genesys, names, onEvent) => {
    names.forEach((name) => {
        genesys('subscribe', `MessagingService.${name}`, (envelope) => {
            onEvent(name, envelope);
        });
    });
};