import { renderPending } from "../message/index.js";
import { strings } from "../strings.js";
import { introText } from "./introText.js";
import { messageEntry } from "./messageEntry.js";
import { noteEntry } from "./noteEntry.js";
/**
 * Lists the transcript rows for a conversation, in the order native Messenger shows them.
 *
 * @param state - The conversation.
 * @param context - Passed to the row renderers; its `formatDate` decides the days.
 * @returns In order:
 *   - when `introText(state)` is defined, the opening line: key `intro`, signature its text,
 *     `render` = `renderTranscriptNote(document, 'intro', text)`;
 *   - every message, in order, each preceded by a date separator when it is the first message or
 *     `context.formatDate` of its time differs from the previous message's: key `d:` + the
 *     message id, signature the formatted date, `render` = `renderTranscriptNote(document, 'day',
 *     date)`. A message's own entry has key `m:` + id, a signature that changes when the message
 *     object's JSON, its `context.isAnswered` value, or the JSON of `context.humanize` and
 *     `context.disconnect` changes, and `render` = `renderMessage`. Whether answers can be sent
 *     right now is not part of a row: `<chat-conversation>` gates the whole transcript;
 *   - right after the entry of the last `Inbound` message without `presence`, when there is one
 *     and nothing is pending, the delivery mark: key `sent`, signature `sent`, `render` =
 *     `renderTranscriptNote(document, 'sent', strings.sent)` (native marks only the last one);
 *   - one entry per pending message: key `p:` + tracingId, signature its JSON, `render` =
 *     `renderPending`.
 * @remarks Pure apart from the deferred `render` calls, which this does not make. Keys are unique.
 */
export const transcriptEntries = (state, context) => {
    const intro = introText(state);
    const lastInbound = state.pending.length === 0
        ? state.messages.findLastIndex((m) => m.direction === 'Inbound' && m.presence === undefined)
        : -1;
    const sent = noteEntry(context.document, 'sent', {
        kind: 'sent',
        text: strings.sent,
        signature: 'sent',
    });
    return [
        ...(intro === undefined
            ? []
            : [noteEntry(context.document, 'intro', { kind: 'intro', text: intro, signature: intro })]),
        ...state.messages.flatMap((message, i) => {
            const date = context.formatDate(message.time);
            const previous = state.messages[i - 1];
            const sameDay = previous !== undefined && context.formatDate(previous.time) === date;
            const day = noteEntry(context.document, `d:${message.id}`, {
                kind: 'day',
                text: date,
                signature: date,
            });
            return [
                ...(sameDay ? [] : [day]),
                messageEntry(message, context),
                ...(i === lastInbound ? [sent] : []),
            ];
        }),
        ...state.pending.map((pending) => ({
            key: `p:${pending.tracingId}`,
            signature: JSON.stringify(pending),
            render: () => renderPending(pending, context),
        })),
    ];
};