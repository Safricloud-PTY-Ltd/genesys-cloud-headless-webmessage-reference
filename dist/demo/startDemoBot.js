import { demoConfiguration } from "./demoConfiguration.js";
import { demoDelete } from "./demoDelete.js";
import { demoSend } from "./demoSend.js";
import { demoSessionCommands } from "./demoSessionCommands.js";
import { demoStartup } from "./demoStartup.js";
import { demoUpload } from "./demoUpload.js";
/**
 * Turns a fake `Genesys` queue into a scripted Genesys deployment: autoStart off, attachments on,
 * typing indicators on, Clear Conversation on, disconnect in ReadOnly mode. Payloads are shaped
 * like a real deployment's (docs/guides/sdk-source-notes.md), so the demo runs the production
 * parsers. Known simplifications: `readOnlyConversation` carries no data, the Disconnect body has
 * no `metadata.readOnly`, an attachment echo is `Structured` rather than `Text`, and an empty
 * `sendMessage` is rejected where the SDK resolves and sends nothing.
 *
 * @param fake - The queue to drive.
 * @param deps - Scheduling, clock and ids.
 * @remarks Republishes `GenesysJS.configurationReceived` at once with `{ deploymentConfig:
 *   demoDeploymentConfig, snippetConfig: {} }` (`fake.republish`, so a subscriber that comes later
 *   still gets it, as live). Schedules (0 ms) `ready` then `allowedFileTypes` (`*\/*`, 10 240 KB, blocked `.exe`).
 *   Session commands (`startConversation`, `resetConversation`, `clearConversation`) are
 *   `demoSessionCommands` on a session cell it shares with `demoSend`. Answers commands:
 *   - `GenesysJS.configuration`: resolves `demoConfiguration`.
 *   - `startConversation`: resolves; publishes `started` (`newSession: true`); then, 400 ms later,
 *     `typingReceived` and 800 ms later the menu (`demoReply('')`).
 *   - `sendMessage`: `sendingFrame` (rejects "Message only contains whitespaces" when it gives
 *     nothing); resolves; publishes `started` (`newSession: true`) first when no session is open
 *     (a first message opens one, as live); publishes `sendingMessage` and the echo (`rawMessage` with the frame's
 *     tracing id, content and `parentMessageId`); then `typingReceived` and, 900 ms later,
 *     `demoReply` of the text or postback payload; for a `disconnect` reply, also the disconnect
 *     sequence `demoBotReply` describes.
 *   - `requestUpload`: resolves; publishes `uploading` 50 then 100 and `fileUploaded` with an
 *     `https://demo.invalid/` URL, remembering the file for the next `sendMessage`.
 *   - `deleteFile` → `demoDelete` (forgets the staged file when its id matches, then `fileDeleted`); `fetchHistory` → `historyComplete`; `getFile` → resolves;
 *     `resetConversation` → `conversationReset` (`newSession: true`) then `started` (`newSession:
 *     true`), as live; `clearConversation` →
 *     `conversationCleared`; `sendTyping` → resolves.
 */
export const startDemoBot = (fake, deps) => {
    const staged = new Map();
    const session = new Set();
    demoStartup(fake, deps);
    fake.onCommand('GenesysJS.configuration', () => ({ kind: 'resolve', value: demoConfiguration }));
    demoSessionCommands(fake, deps, session);
    fake.onCommand('MessagingService.sendMessage', demoSend(fake, deps, { staged, session }));
    fake.onCommand('MessagingService.requestUpload', demoUpload(fake, deps, staged));
    fake.onCommand('MessagingService.deleteFile', demoDelete(fake, staged));
    const announced = [['fetchHistory', 'historyComplete', {}]];
    announced.forEach(([command, event, data]) => {
        fake.onCommand(`MessagingService.${command}`, () => {
            fake.publish(`MessagingService.${event}`, data);
            return { kind: 'resolve' };
        });
    });
    ['getFile', 'sendTyping'].forEach((command) => {
        fake.onCommand(`MessagingService.${command}`, () => ({ kind: 'resolve' }));
    });
};