import { err, ok } from '#shared';
import { commandRejected, commandTimedOut, } from "../../types.js";
import { describeReason } from "./describeReason.js";
/**
 * Runs one SDK command through the `Genesys` queue and turns its two callbacks into a Result.
 *
 * @param deps - The queue, the timer functions and `timeoutMs`.
 * @param command - The full command name, `Plugin.command` (`MessagingService.sendMessage`).
 * @param options - The command's options object, passed through unchanged; `{}` for none.
 * @returns The value the fulfilled callback received (often `undefined`).
 * @errors CommandRejected - when the rejected callback fires; `reason` is `describeReason` of
 *   its argument. CommandTimedOut - when neither callback fires within `deps.timeoutMs`.
 * @remarks Calls `deps.genesys('command', command, options, onResolved, onRejected)` exactly
 *   once, synchronously. Settles once: the first of resolve, reject or timeout wins and later
 *   callbacks are ignored. Clears its timer when a callback wins. The promise never rejects: a synchronous throw from the
 *   queue clears the timer and resolves `commandRejected(command, describeReason(error))`.
 */
export const runCommand = (deps, command, options) => {
    // A Promise settles once, so whichever of the paths calls resolve first wins and the
    // others become no-ops; clearing a timer that has already fired is harmless.
    return new Promise((resolve) => {
        const timer = deps.setTimeout(() => {
            resolve(err(commandTimedOut(command, deps.timeoutMs)));
        }, deps.timeoutMs);
        // The queue is a foreign API that can throw synchronously (for example before the snippet
        // has loaded); convert that to the same CommandRejected a rejected callback produces.
        try {
            deps.genesys('command', command, options, (value) => {
                deps.clearTimeout(timer);
                resolve(ok(value));
            }, (reason) => {
                deps.clearTimeout(timer);
                resolve(err(commandRejected(command, describeReason(reason))));
            });
        }
        catch (error) {
            deps.clearTimeout(timer);
            resolve(err(commandRejected(command, describeReason(error))));
        }
    });
};