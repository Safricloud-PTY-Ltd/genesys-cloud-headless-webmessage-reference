import { err } from '#shared';
import { commandRejected, commandTimedOut, } from "../../types.js";
import { describeReason } from "./describeReason.js";
import { parseLookAndFeel } from "./parse/index.js";
const EVENT = 'GenesysJS.configurationReceived';
/**
 * Reads the deployment's look and feel from the undocumented `GenesysJS.configurationReceived`
 * event. The documented `GenesysJS.configuration` command trims every look-and-feel field
 * (docs/guides/loading-the-sdk.md); this event carries the untrimmed config.
 *
 * @param deps - The queue, the timer functions and `timeoutMs`.
 * @returns `parseLookAndFeel` of the first envelope the subscription receives.
 * @errors InvalidPayload - when `parseLookAndFeel` rejects that envelope. CommandTimedOut
 *   (command `GenesysJS.configurationReceived`, `afterMs` = `deps.timeoutMs`) - when no envelope
 *   arrives within `deps.timeoutMs`. CommandRejected (same command, `describeReason` of the
 *   error) - when the queue throws synchronously on subscribe.
 * @remarks Calls `deps.genesys('subscribe', 'GenesysJS.configurationReceived', callback)` once,
 *   synchronously. The SDK republishes the event, so a subscription made after it fired is
 *   answered at once with the stored payload (sdk-source-notes.md). Settles once: later envelopes
 *   are ignored, and the timer is cleared when an envelope wins. Never rejects. The queue has no
 *   unsubscribe, so call it once per page.
 */
export const readLookAndFeel = (deps) => {
    // A Promise settles once, so whichever of envelope, throw or timeout resolves first wins.
    return new Promise((resolve) => {
        // Armed before subscribing: the SDK replays a stored payload synchronously inside the
        // subscribe call, and that replay must find a timer to clear.
        const timer = deps.setTimeout(() => {
            resolve(err(commandTimedOut(EVENT, deps.timeoutMs)));
        }, deps.timeoutMs);
        try {
            deps.genesys('subscribe', EVENT, (envelope) => {
                deps.clearTimeout(timer);
                resolve(parseLookAndFeel(envelope));
            });
        }
        catch (error) {
            deps.clearTimeout(timer);
            resolve(err(commandRejected(EVENT, describeReason(error))));
        }
    });
};