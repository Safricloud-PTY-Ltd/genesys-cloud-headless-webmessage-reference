import { demoDeploymentConfig } from "./demoDeploymentConfig.js";
/**
 * Publishes what a live deployment publishes on its own as the page loads.
 *
 * @param fake - The queue to drive.
 * @param deps - Scheduling.
 * @remarks Republishes `GenesysJS.configurationReceived` at once with `{ deploymentConfig:
 *   demoDeploymentConfig, snippetConfig: {} }` (`fake.republish`, so a later subscriber still gets
 *   it, as live); then schedules (0 ms) `MessagingService.ready` followed by
 *   `MessagingService.allowedFileTypes` (`*\/*`, 10 240 KB, blocked `.exe`). Part of
 *   `startDemoBot`; tested through it.
 */
export const demoStartup = (fake, deps) => {
    fake.republish('GenesysJS.configurationReceived', {
        deploymentConfig: demoDeploymentConfig,
        snippetConfig: {},
    });
    deps.schedule(() => {
        fake.publish('MessagingService.ready');
        fake.publish('MessagingService.allowedFileTypes', {
            allowedMedia: { inbound: { fileTypes: [{ type: '*/*' }], maxFileSizeKB: 10240 } },
            blockedExtensions: ['.exe'],
        });
    }, 0);
};