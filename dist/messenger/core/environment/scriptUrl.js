import { scriptHosts } from "./scriptHosts.js";
/**
 * Gives the URL of the Messenger bootstrap script for a region.
 *
 * @param environment - A region checked by `toEnvironment`.
 * @returns `https://<host>/genesys-bootstrap/genesys.min.js` for the region's host.
 * @remarks Pure. Total: every `Environment` has a host.
 */
export const scriptUrl = (environment) => {
    // Every Environment has a host; the fallback only satisfies noUncheckedIndexedAccess.
    return `https://${scriptHosts[environment] ?? ''}/genesys-bootstrap/genesys.min.js`;
};