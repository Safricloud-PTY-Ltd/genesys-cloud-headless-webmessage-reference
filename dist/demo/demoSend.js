import { isRecord } from '#shared';
import { demoBotReply } from "./demoBotReply.js";
import { echoMessage } from "./echoMessage.js";
import { replyText } from "./replyText.js";
import { sendingFrame } from "./sendingFrame.js";
import { withUploadedFile } from "./withUploadedFile.js";
/**
 * Makes the demo's `sendMessage` handler.
 *
 * @param fake - The queue to publish on.
 * @param deps - Scheduling, clock and ids.
 * @param cells - The staged-file cell shared with `demoUpload`, and the session cell shared with
 *   `demoSessionCommands`.
 * @returns A handler: builds `sendingFrame(options, deps.randomId(), staged file's attachmentId)`.
 *   When that is `undefined`, it rejects with `new Error('Message only contains whitespaces')`
 *   and publishes nothing. Otherwise: when the session is not `open`, marks it `open` and
 *   publishes `started` (`newSession: true`) first, as a live `sendMessage` opens a session when
 *   none exists (messaging-service.md); then clears `staged`, publishes `sendingMessage`
 *   (`{ message: frame }`) and `messagesReceived` with
 *   `echoMessage(withUploadedFile(frame, staged file), deps.randomId(), deps.now())`, calls
 *   `demoBotReply` with `replyText(options)` (typing 0 ms, reply 900 ms), and resolves.
 * @remarks Part of `startDemoBot`; tested through it.
 */
export const demoSend = (fake, deps, cells) => {
    return (options) => {
        const file = cells.staged.get('file');
        const frame = sendingFrame(isRecord(options) ? options : {}, deps.randomId(), file?.attachmentId);
        if (frame === undefined) {
            return { kind: 'reject', reason: new Error('Message only contains whitespaces') };
        }
        if (!cells.session.has('open')) {
            // eslint-disable-next-line functional/immutable-data -- the session is a cell the demo handlers share
            cells.session.add('open');
            fake.publish('MessagingService.started', { newSession: true });
        }
        // eslint-disable-next-line functional/immutable-data -- the staged file is a cell the demo handlers share
        cells.staged.clear();
        fake.publish('MessagingService.sendingMessage', { message: frame });
        fake.publish('MessagingService.messagesReceived', {
            messages: [echoMessage(withUploadedFile(frame, file), deps.randomId(), deps.now())],
        });
        demoBotReply(fake, deps, { text: replyText(options), typingMs: 0, replyMs: 900 });
        return { kind: 'resolve' };
    };
};