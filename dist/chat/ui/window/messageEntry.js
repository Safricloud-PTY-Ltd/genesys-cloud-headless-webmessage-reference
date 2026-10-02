import { renderMessage } from "../message/index.js";
/**
 * The transcript row for one message.
 *
 * @param message - The message.
 * @param context - The render context.
 * @returns Key `m:` + id; a signature joining the message's JSON, `context.isAnswered(id)`, and
 *   the JSON of `[context.humanize, context.disconnect]`, so the row is redrawn when any of them
 *   changes; `render` = `renderMessage(message, context)`, not called here.
 * @remarks Part of `transcriptEntries`; tested through it.
 */
export const messageEntry = (message, context) => {
    const answered = String(context.isAnswered(message.id));
    const look = JSON.stringify([context.humanize, context.disconnect]);
    return {
        key: `m:${message.id}`,
        signature: `${JSON.stringify(message)}|${answered}|${look}`,
        render: () => renderMessage(message, context),
    };
};