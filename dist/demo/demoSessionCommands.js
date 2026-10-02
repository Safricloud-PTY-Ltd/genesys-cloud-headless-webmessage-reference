import { demoBotReply } from "./demoBotReply.js";
/**
 * Answers the commands that open and close the demo's session, as a live deployment does.
 *
 * @param fake - The queue to drive.
 * @param deps - Scheduling, clock and ids.
 * @param session - The session cell shared with `demoSend`.
 * @remarks Registers handlers, each resolving:
 *   - `startConversation`: marks the session `open`; publishes `started` (`newSession: true`);
 *     then `demoBotReply(fake, deps, { text: '', typingMs: 400, replyMs: 800 })` (the menu).
 *   - `resetConversation`: marks it `open`; publishes `conversationReset` (`newSession: true`)
 *     then `started` (`newSession: true`), as live.
 *   - `clearConversation`: clears the cell; publishes `conversationCleared`.
 *   Part of `startDemoBot`; tested through it.
 */
export const demoSessionCommands = (fake, deps, session) => {
    fake.onCommand('MessagingService.startConversation', () => {
        // eslint-disable-next-line functional/immutable-data -- the session is a cell the demo handlers share
        session.add('open');
        fake.publish('MessagingService.started', { newSession: true });
        demoBotReply(fake, deps, { text: '', typingMs: 400, replyMs: 800 });
        return { kind: 'resolve' };
    });
    fake.onCommand('MessagingService.resetConversation', () => {
        // eslint-disable-next-line functional/immutable-data -- the session is a cell the demo handlers share
        session.add('open');
        fake.publish('MessagingService.conversationReset', { newSession: true });
        fake.publish('MessagingService.started', { newSession: true });
        return { kind: 'resolve' };
    });
    fake.onCommand('MessagingService.clearConversation', () => {
        // eslint-disable-next-line functional/immutable-data -- the session is a cell the demo handlers share
        session.clear();
        fake.publish('MessagingService.conversationCleared', {});
        return { kind: 'resolve' };
    });
};