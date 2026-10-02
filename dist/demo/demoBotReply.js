import { demoReply } from "./demoReply.js";
import { rawMessage } from "./rawMessage.js";
/**
 * Schedules the demo bot's answer: a typing indicator, then the reply, then a disconnect when the
 * reply ends the conversation.
 *
 * @param fake - The queue to publish on.
 * @param deps - Scheduling, clock and ids.
 * @param turn - What to answer and when.
 * @remarks At `typingMs`: `typingReceived` (`{ typing: { type: 'On', durationMs: 5000 } }`). At
 *   `replyMs`: `messagesReceived` with one outbound `rawMessage` (id `deps.randomId()`, time
 *   `deps.now()`) carrying `demoReply(text, deps.now())`'s text and content; for a `disconnect`
 *   reply, then, in a live deployment's order: `conversationDisconnected` (`{ message: <the
 *   Disconnect body>, readOnly: true }`), `messagesReceived` with that Disconnect body (an outbound
 *   `rawMessage` with `presence: 'Disconnect'`, a new id and a time just after the reply), and
 *   `readOnlyConversation` (with no data; live carries the session frame, which the parser
 *   handles either way). Part of `startDemoBot`; tested through it.
 */
export const demoBotReply = (fake, deps, turn) => {
    deps.schedule(() => {
        fake.publish('MessagingService.typingReceived', { typing: { type: 'On', durationMs: 5000 } });
    }, turn.typingMs);
    deps.schedule(() => {
        const at = deps.now();
        const reply = demoReply(turn.text, at);
        const message = rawMessage({
            id: deps.randomId(),
            direction: 'Outbound',
            time: at,
            ...(reply.text === undefined ? {} : { text: reply.text }),
            content: reply.content,
        });
        fake.publish('MessagingService.messagesReceived', { messages: [message] });
        if (reply.disconnect) {
            const body = rawMessage({
                id: deps.randomId(),
                direction: 'Outbound',
                time: at + 1,
                presence: 'Disconnect',
            });
            fake.publish('MessagingService.conversationDisconnected', { message: body, readOnly: true });
            fake.publish('MessagingService.messagesReceived', { messages: [body] });
            fake.publish('MessagingService.readOnlyConversation');
        }
    }, turn.replyMs);
};