import { err, ok } from '#shared';
import { toEnvironment } from '#messenger';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/**
 * Reads the page's configuration from its URL query string. The deployment id is never committed
 * to the repo (it would become permanent in the public export), so it arrives at runtime:
 * `?deploymentId=<uuid>&environment=prod-euw1`, or `?demo` for the scripted demo.
 *
 * @param search - `location.search`, with or without the leading `?`. May be empty.
 * @returns `demo` when a `demo` parameter is present (any value; it wins over everything else);
 *   otherwise `live` with the trimmed `deploymentId` and the `environment` checked by
 *   `toEnvironment`. `markdown` is `false` only when `markdown=off`.
 * @errors Checked in this order: MissingDeploymentId - when `deploymentId` is absent or blank.
 *   InvalidDeploymentId - when it isn't a UUID (8-4-4-4-12 hex digits, any case), carrying it.
 *   MissingEnvironment - when `environment` is absent or blank. UnknownEnvironment - when
 *   `toEnvironment` rejects it.
 * @remarks Pure.
 */
export const readConfig = (search) => {
    const params = new URLSearchParams(search);
    const markdown = params.get('markdown') !== 'off';
    if (params.has('demo'))
        return ok({ kind: 'demo', markdown });
    const deploymentId = (params.get('deploymentId') ?? '').trim();
    if (deploymentId === '')
        return err({ kind: 'MissingDeploymentId' });
    if (!UUID.test(deploymentId))
        return err({ kind: 'InvalidDeploymentId', value: deploymentId });
    const rawEnvironment = params.get('environment') ?? '';
    if (rawEnvironment.trim() === '')
        return err({ kind: 'MissingEnvironment' });
    const environment = toEnvironment(rawEnvironment);
    if (!environment.ok)
        return err(environment.error);
    return ok({ kind: 'live', deploymentId, environment: environment.value, markdown });
};