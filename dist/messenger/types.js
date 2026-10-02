/**
 * What native Messenger uses when the deployment says nothing: primary `#0165a7`, `Auto`
 * alignment, 20 px from the side and 12 px from the bottom, the launcher `On` showing its
 * `Icon`, no home screen, no custom labels, no humanize (docs/guides/native-messenger-ui.md).
 */
export const nativeLookAndFeel = {
    primaryColor: '#0165a7',
    alignment: 'Auto',
    sideSpace: 20,
    bottomSpace: 12,
    launcher: { visibility: 'On', display: 'Icon' },
    homeScreen: { enabled: false },
    labels: [],
    humanize: { enabled: false },
};
/**
 * Builds a `CommandRejected` error.
 *
 * @param command - The command name, `Plugin.command`.
 * @param reason - The SDK's rejection, already turned into text.
 * @returns The error value.
 */
export const commandRejected = (command, reason) => ({
    kind: 'CommandRejected',
    command,
    reason,
});
/**
 * Builds a `CommandTimedOut` error.
 *
 * @param command - The command name, `Plugin.command`.
 * @param afterMs - How long the adapter waited.
 * @returns The error value.
 */
export const commandTimedOut = (command, afterMs) => ({
    kind: 'CommandTimedOut',
    command,
    afterMs,
});
/**
 * Builds an `InvalidPayload` error.
 *
 * @param source - The event or command whose payload failed to parse.
 * @param reason - What was wrong, for the console.
 * @returns The error value.
 */
export const invalidPayload = (source, reason) => ({
    kind: 'InvalidPayload',
    source,
    reason,
});
/**
 * Builds an `UnknownEnvironment` error.
 *
 * @param value - The rejected `environment` value.
 * @returns The error value.
 */
export const unknownEnvironment = (value) => ({
    kind: 'UnknownEnvironment',
    value,
});