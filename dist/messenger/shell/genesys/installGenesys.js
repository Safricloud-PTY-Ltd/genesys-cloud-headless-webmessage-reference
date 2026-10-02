import { scriptUrl } from "../../core/index.js";
/**
 * Does what the Genesys deployment snippet does: defines the `Genesys` command queue on
 * `window` and appends the regional `genesys.min.js` script, which drains the queue once it
 * loads. Use it instead of pasting the snippet when the deployment id comes from runtime
 * configuration. See docs/guides/loading-the-sdk.md, "The single snippet".
 *
 * @param deps - The window, its document and a clock.
 * @param deploymentId - The deployment's UUID, passed to the SDK unchanged.
 * @param environment - The deployment's region; picks the script host via `scriptUrl`.
 * @returns A function that forwards each call, arguments unchanged, to whatever `window.Genesys`
 *   is at the time of the call: the queue until `genesys.min.js` loads, then the SDK's own
 *   function, which **replaces** `window.Genesys` (measured live; loading-the-sdk.md). Holding the
 *   queue function itself would send every later call into a queue nobody reads. When
 *   `window.Genesys` already exists (the snippet ran, or this was called before), nothing is
 *   defined and no script is appended; the forwarder is returned all the same.
 * @remarks Sets, exactly as the snippet does: `window._genesysJs = 'Genesys'`, `window.Genesys`
 *   (a function pushing its `arguments` onto its own `q` array), `Genesys.t = deps.now()`,
 *   `Genesys.c = { environment, deploymentId }`, and appends to `document.head` a
 *   `<script async charset="utf-8" src="...">`.
 */
export const installGenesys = (deps, deploymentId, environment) => {
    const existing = Reflect.get(deps.window, 'Genesys');
    if (typeof existing !== 'function') {
        // eslint-disable-next-line functional/prefer-immutable-types -- the snippet's contract: Genesys.q is a mutable array genesys.min.js drains
        const queue = [];
        const genesys = Object.assign((...args) => {
            // eslint-disable-next-line functional/immutable-data -- the snippet's contract: genesys.min.js drains this global queue on load
            queue.push(args);
        }, { q: queue, t: deps.now(), c: { environment, deploymentId } });
        Reflect.set(deps.window, '_genesysJs', 'Genesys');
        Reflect.set(deps.window, 'Genesys', genesys);
        const script = deps.document.createElement('script');
        script.setAttribute('async', '');
        script.setAttribute('charset', 'utf-8');
        script.setAttribute('src', scriptUrl(environment));
        deps.document.head.append(script);
    }
    // genesys.min.js replaces window.Genesys on load, so the target is looked up per call.
    return (action, ...args) => {
        const current = Reflect.get(deps.window, 'Genesys');
        return typeof current === 'function'
            ? Reflect.apply(current, undefined, [action, ...args])
            : undefined;
    };
};