import { fakeGenesys, installGenesys } from '#messenger';
import { startDemoBot } from '#demo';
/**
 * Gives the page a `Genesys` command queue: the real SDK for a deployment, or the scripted demo.
 *
 * @param config - What to run.
 * @param host - The window and document.
 * @returns For `live`: `installGenesys({ window, document, now: Date.now }, deploymentId,
 *   environment)`, which loads Genesys' script. For `demo`: a `fakeGenesys()` queue with
 *   `startDemoBot` driving it (`schedule` = `window.setTimeout`, `now` = `Date.now`, `randomId` =
 *   `window.crypto.randomUUID` when it exists, which is only in secure contexts, else a
 *   `Math.random`-based id, so `?demo` works over plain HTTP too), and no network at all.
 * @remarks The only place that decides between the real SDK and the fake.
 */
export const createGenesys = (config, host) => {
    if (config.kind === 'live') {
        return installGenesys({ window: host.window, document: host.document, now: Date.now }, config.deploymentId, config.environment);
    }
    const fake = fakeGenesys();
    startDemoBot(fake, {
        schedule: (callback, ms) => {
            host.window.setTimeout(callback, ms);
        },
        now: Date.now,
        // randomUUID exists only in secure contexts; `?demo` must also work over plain HTTP.
        randomId: () => typeof host.window.crypto.randomUUID === 'function'
            ? host.window.crypto.randomUUID()
            : `demo-${Math.random().toString(36).slice(2)}`,
    });
    return fake.genesys;
};