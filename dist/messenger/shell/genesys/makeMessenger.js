import { makeEmitter } from '#shared';
import { makeCommands } from "./makeCommands.js";
import { messengerEventNames, parseEvent } from "./parse/index.js";
import { subscribeAll } from "./subscribeAll.js";
/**
 * Builds the real `Messenger` port on the `Genesys` command queue: subscribes once to every
 * event the reference understands, parses each payload, and fans the parsed events out to
 * however many listeners subscribe later.
 *
 * @param deps - The queue, timers, timeout and warning sink.
 * @returns The port. Its `subscribe` adds a listener to an in-page emitter, never to the queue,
 *   so listeners can come and go (custom elements mounting and unmounting) without leaking SDK
 *   subscriptions.
 * @remarks Subscribes synchronously, before returning, to every name in `messengerEventNames`
 *   via `subscribeAll`; call it right after the queue exists so no early event is missed. A
 *   payload `parseEvent` rejects is reported as `deps.warn('Ignored MessagingService.<name>: <reason>',
 *   { error, envelope })` (the `InvalidPayload` and the raw envelope), and no event is emitted for it.
 *   A payload `parseEvent` reads as `undefined` (nothing happened) emits nothing and warns nothing. Commands come from `makeCommands`.
 */
export const makeMessenger = (deps) => {
    const emitter = makeEmitter();
    subscribeAll(deps.genesys, messengerEventNames, (name, envelope) => {
        const parsed = parseEvent(name, envelope);
        if (!parsed.ok) {
            deps.warn(`Ignored MessagingService.${name}: ${parsed.error.reason}`, {
                error: parsed.error,
                envelope,
            });
        }
        else if (parsed.value !== undefined) {
            emitter.emit(parsed.value);
        }
    });
    return { subscribe: emitter.subscribe, ...makeCommands(deps) };
};