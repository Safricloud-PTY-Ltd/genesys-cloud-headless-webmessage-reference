/**
 * Creates an empty emitter: the dispatcher the messenger shell fans SDK events out through,
 * because the Genesys command queue has no way to unsubscribe.
 *
 * @returns An emitter with no listeners.
 * @remarks Listeners added or removed while an event is being emitted take effect from the
 *   next `emit`. The same listener function subscribed twice is called twice, and each returned
 *   unsubscribe removes one registration. A listener that throws is not caught: it is a bug
 *   in the listener, and the remaining listeners for that event are skipped.
 */
export const makeEmitter = () => {
    // One record per subscribe call, so the same function subscribed twice is two registrations.
    const registrations = new Set();
    return {
        subscribe: (listener) => {
            const registration = { listener };
            // eslint-disable-next-line functional/immutable-data -- the emitter's registry is the one mutable cell it owns
            registrations.add(registration);
            return () => {
                // eslint-disable-next-line functional/immutable-data -- the emitter's registry is the one mutable cell it owns
                registrations.delete(registration);
            };
        },
        emit: (event) => {
            // A snapshot, so subscribes and unsubscribes made by listeners apply from the next emit.
            Array.from(registrations).forEach((registration) => {
                registration.listener(event);
            });
        },
    };
};