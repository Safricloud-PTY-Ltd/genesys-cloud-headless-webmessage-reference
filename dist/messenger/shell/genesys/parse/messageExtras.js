import { readString } from '#shared';
import { hasAnswersBeyondText } from "./hasAnswersBeyondText.js";
/**
 * The optional fields both message shapes carry the same way.
 *
 * @param message - The message record (either shape).
 * @param reply - Its reply facts.
 * @param direction - The message's direction, from its envelope.
 * @returns Only the fields present: `originatingEntity` when `Human`/`Bot`, `tracingId` when a
 *   non-empty string, `replyTo` from `reply`, `consumed: true` when `state` is `"consumed"`, and
 *   `answers` from `reply`, only on an `Inbound` message (a customer's answer), when the message has its own non-empty `text` and `reply.answers` is
 *   non-empty and does not just repeat it (its `", "` join differs from `text`). A quick-reply
 *   answer, whose text is the label, and an answer with no text of its own (shown as
 *   `fallbackText`) get no `answers`.
 * @remarks Pure. Part of the message parsers; tested through them.
 */
export const messageExtras = (message, reply, direction) => {
    const entity = readString(message, 'originatingEntity');
    const tracingId = readString(message, 'tracingId');
    return {
        ...(entity === 'Human' || entity === 'Bot' ? { originatingEntity: entity } : {}),
        ...(tracingId ? { tracingId } : {}),
        ...(reply.replyTo === undefined ? {} : { replyTo: reply.replyTo }),
        ...(readString(message, 'state') === 'consumed' ? { consumed: true } : {}),
        ...(direction === 'Inbound' && hasAnswersBeyondText(readString(message, 'text'), reply.answers)
            ? { answers: reply.answers }
            : {}),
    };
};