import { ok } from '#shared';
import { parseDeploymentSettings } from "./parse/index.js";
import { readLookAndFeel } from "./readLookAndFeel.js";
import { runCommand } from "./runCommand.js";
import { toPostbackOptions } from "./toPostbackOptions.js";
/**
 * Runs a command whose fulfilled value carries nothing useful.
 *
 * @param deps - The queue, timers and timeout.
 * @param command - The full command name.
 * @param options - The command's options.
 * @returns `ok(undefined)` when the command is fulfilled; its `CommandRejected` or
 *   `CommandTimedOut` otherwise.
 */
const voidCommand = (deps, command, options) => {
    return runCommand(deps, command, options).then((r) => (r.ok ? ok(undefined) : r));
};
/**
 * Builds the command half of the `Messenger` port on top of the `Genesys` queue.
 *
 * @param deps - The queue, timers, timeout and warning sink.
 * @returns One function per command. Each sends `MessagingService.<name>` (but
 *   `MessagingService.sendMessage` for `sendPostback`, the SDK's one command for answers, and
 *   `GenesysJS.configuration` for `readSettings`) through `runCommand` and maps a fulfilled
 *   value to `ok(undefined)`, except `readSettings`, which parses it with
 *   `parseDeploymentSettings`. Options: `sendMessage(text)` → `{ message: text }`;
 *   `sendPostback(p)` → `toPostbackOptions(p)`; `requestUpload(files)` → `{ file: files }`;
 *   `deleteFile(id)` and `getFile(id)` → `{ id }`; `refreshFiles(ids)` → `{ files: [{ id }, ...] }`
 *   in order; all others → `{}`.
 *   `readLookAndFeel` is `readLookAndFeel(deps)`, which subscribes rather than commands.
 * @remarks `sendTyping` calls `deps.genesys('command', 'MessagingService.sendTyping', {}, ...)`
 *   directly with no-op callbacks and no timer: the SDK leaves throttled calls unanswered.
 */
export const makeCommands = (deps) => {
    return {
        readSettings: () => runCommand(deps, 'GenesysJS.configuration', {}).then((r) => r.ok ? parseDeploymentSettings(r.value) : r),
        readLookAndFeel: () => readLookAndFeel(deps),
        startConversation: () => voidCommand(deps, 'MessagingService.startConversation', {}),
        sendMessage: (text) => voidCommand(deps, 'MessagingService.sendMessage', { message: text }),
        sendPostback: (postback) => voidCommand(deps, 'MessagingService.sendMessage', toPostbackOptions(postback)),
        // No timer: the SDK throttles sendTyping and leaves the dropped calls unanswered.
        sendTyping: () => {
            deps.genesys('command', 'MessagingService.sendTyping', {}, () => undefined, () => undefined);
        },
        fetchHistory: () => voidCommand(deps, 'MessagingService.fetchHistory', {}),
        requestUpload: (files) => voidCommand(deps, 'MessagingService.requestUpload', { file: files }),
        deleteFile: (id) => voidCommand(deps, 'MessagingService.deleteFile', { id }),
        getFile: (id) => voidCommand(deps, 'MessagingService.getFile', { id }),
        refreshFiles: (ids) => voidCommand(deps, 'MessagingService.refreshFiles', { files: ids.map((id) => ({ id })) }),
        resetConversation: () => voidCommand(deps, 'MessagingService.resetConversation', {}),
        clearConversation: () => voidCommand(deps, 'MessagingService.clearConversation', {}),
    };
};