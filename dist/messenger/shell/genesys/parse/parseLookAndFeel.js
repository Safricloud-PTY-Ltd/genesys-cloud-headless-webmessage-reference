import { err, isRecord, ok, readRecord } from '#shared';
import { invalidPayload } from "../../../types.js";
import { readCustomLabels } from "./readCustomLabels.js";
import { readEnvelopeData } from "./readEnvelopeData.js";
import { readHomeScreen } from "./readHomeScreen.js";
import { readHumanize } from "./readHumanize.js";
import { readLauncherButton } from "./readLauncherButton.js";
import { readPosition } from "./readPosition.js";
import { readPrimaryColor } from "./readPrimaryColor.js";
const source = 'GenesysJS.configurationReceived';
/**
 * Reads the deployment's look and feel from a `GenesysJS.configurationReceived` envelope, whose
 * `data.deploymentConfig` is the untrimmed `config.json` (docs/guides/sdk-source-notes.md,
 * "Reading the deployment configuration"). A replayed envelope has no `eventName`, so nothing
 * here reads it.
 *
 * @param envelope - Untrusted: the subscribe callback's argument, `{ data: { deploymentConfig } }`.
 * @returns Every field from its reader, each falling back to `nativeLookAndFeel` on its own:
 *   `primaryColor` from `readPrimaryColor`; `alignment`, `sideSpace` and `bottomSpace` from
 *   `readPosition`; `launcher` from `readLauncherButton`; `homeScreen` from `readHomeScreen`;
 *   `labels` from `readCustomLabels`; `humanize` from `readHumanize`. A config with none of these
 *   fields gives exactly `nativeLookAndFeel`.
 * @errors InvalidPayload (source `GenesysJS.configurationReceived`) - when `data.deploymentConfig`
 *   is not a record (or the envelope or its `data` is not one).
 * @remarks Pure.
 */
export const parseLookAndFeel = (envelope) => {
    const data = readEnvelopeData(envelope);
    if (!isRecord(data)) {
        return err(invalidPayload(source, 'data is not a record'));
    }
    const config = readRecord(data, 'deploymentConfig');
    if (config === undefined) {
        return err(invalidPayload(source, 'data.deploymentConfig is not a record'));
    }
    return ok({
        primaryColor: readPrimaryColor(config),
        ...readPosition(config),
        launcher: readLauncherButton(config),
        homeScreen: readHomeScreen(config),
        labels: readCustomLabels(config),
        humanize: readHumanize(config),
    });
};