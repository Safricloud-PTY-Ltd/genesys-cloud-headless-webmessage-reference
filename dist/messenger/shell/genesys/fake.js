/**
 * Delivers a live publish: calls every function subscriber of `name`, in subscription order,
 * with `{ event: name, eventName, data }`, where `eventName` is the part of `name` after its
 * first dot.
 *
 * @param subscriptions - Every subscription so far, oldest first.
 * @param name - The full event name.
 * @param data - The payload.
 * @remarks Part of `fakeGenesys` (`publish` and `republish`); tested through it.
 */
const publishToSubscribers = (subscriptions, name, data) => {
    const envelope = { event: name, eventName: name.slice(name.indexOf('.') + 1), data };
    subscriptions.forEach((s) => {
        if (s.name === name && typeof s.callback === 'function') {
            s.callback(envelope);
        }
    });
};
/**
 * Replays a republished payload to one new subscriber, as CXBus does.
 *
 * @param stored - The last republished payload per event name.
 * @param name - The subscription's event name, as given.
 * @param callback - The subscription's callback, as given.
 * @remarks Calls `callback` once with `{ event: name, data: <stored payload> }` (no `eventName`)
 *   when it is a function and a payload is stored for `name`; otherwise does nothing. Part of
 *   `fakeGenesys`; tested through it.
 */
const replayStored = (stored, name, callback) => {
    if (typeof callback === 'function' && typeof name === 'string' && stored.has(name)) {
        callback({ event: name, data: stored.get(name) });
    }
};
/**
 * Creates a fake `Genesys` command queue: no SDK, no network. It understands the `subscribe`
 * and `command` actions and ignores every other action.
 *
 * @returns A fresh fake with no subscribers, no recorded commands and no handlers.
 * @remarks `republish` as its type describes; a stored payload is replayed to subscribers added
 *   after it. A command with no handler resolves with `undefined`. Callbacks are called
 *   synchronously (the real SDK is asynchronous; code that works with the fake must not depend
 *   on either). Arguments that aren't functions where callbacks belong are ignored, so
 *   `command` with no callbacks still records the command. Several subscribers to one event
 *   are called in subscription order.
 */
export const fakeGenesys = () => {
    // The fake is a stateful test double; these collections are owned by this closure alone.
    // eslint-disable-next-line functional/prefer-immutable-types -- closure-owned fake state
    const subscriptions = [];
    // eslint-disable-next-line functional/prefer-immutable-types -- closure-owned fake state
    const sent = [];
    const handlers = new Map();
    const stored = new Map();
    return {
        genesys: (action, ...args) => {
            const [name, second, resolve, reject] = args;
            if (action === 'subscribe') {
                // eslint-disable-next-line functional/immutable-data -- closure-owned fake state
                subscriptions.push({ name, callback: second });
                replayStored(stored, name, second);
            }
            if (action !== 'command')
                return;
            const command = { name: String(name), options: second };
            // eslint-disable-next-line functional/immutable-data -- closure-owned fake state
            sent.push(command);
            const reply = handlers.get(command.name)?.(second) ?? { kind: 'resolve' };
            if (reply.kind === 'hang')
                return;
            const [callback, result] = reply.kind === 'resolve' ? [resolve, reply.value] : [reject, reply.reason];
            if (typeof callback === 'function')
                callback(result);
        },
        publish: (name, data = {}) => {
            publishToSubscribers(subscriptions, name, data);
        },
        republish: (name, data = {}) => {
            publishToSubscribers(subscriptions, name, data);
            // eslint-disable-next-line functional/immutable-data -- closure-owned fake state
            stored.set(name, data);
        },
        commands: () => [...sent],
        onCommand: (name, handler) => {
            // eslint-disable-next-line functional/immutable-data -- closure-owned fake state
            handlers.set(name, handler);
        },
    };
};